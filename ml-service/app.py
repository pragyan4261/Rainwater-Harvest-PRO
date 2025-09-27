import asyncio
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import k_means_v3
from groundwater_predictor import groundwater_predictor


SELF_PING_URL = (os.environ.get("SELF_PING_URL") or os.environ.get("RENDER_EXTERNAL_URL") or "").rstrip("/")


def _resolve_keep_alive_seconds() -> int:
    raw_value = os.environ.get("KEEP_ALIVE_INTERVAL_SECONDS", "840")
    try:
        parsed = int(raw_value)
    except (TypeError, ValueError):
        parsed = 840
    return max(parsed, 60)


KEEP_ALIVE_SECONDS = _resolve_keep_alive_seconds()


async def _keep_awake_loop():
    if not SELF_PING_URL:
        return

    async with httpx.AsyncClient(timeout=10.0) as client:
        while True:
            try:
                response = await client.get(f"{SELF_PING_URL}/health")
                timestamp = datetime.now(timezone.utc).isoformat()
                print(f"[KeepAlive] Ping succeeded: {response.status_code} at {timestamp}")
            except Exception as exc:  # noqa: BLE001
                print(f"[KeepAlive] Ping failed: {exc}")

            await asyncio.sleep(KEEP_ALIVE_SECONDS)


# ✅ Use lifespan instead of on_event
@asynccontextmanager
async def lifespan(app: FastAPI):
    task: Optional[asyncio.Task] = None

    if SELF_PING_URL:
        task = asyncio.create_task(_keep_awake_loop())
        print(f"[KeepAlive] Started for {SELF_PING_URL} (every {KEEP_ALIVE_SECONDS}s)")
    else:
        print("[KeepAlive] Disabled (missing SELF_PING_URL/RENDER_EXTERNAL_URL)")

    yield  # App runs here

    if task:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


# Create app with lifespan
app = FastAPI(lifespan=lifespan)


class AssessmentInput(BaseModel):
    roof_area: float
    roof_type: str
    soil_type: str
    annual_rainfall: float
    state: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class GroundwaterInput(BaseModel):
    state: str
    district: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


def _run_prediction(data: AssessmentInput):
    # Get groundwater level prediction if state and district are provided
    groundwater_level = 10.0  # Default
    if data.state and data.district:
        gw_result = groundwater_predictor.predict_groundwater_level(
            state=data.state,
            district=data.district,
            latitude=data.latitude,
            longitude=data.longitude
        )
        groundwater_level = gw_result.get('groundwater_level', 10.0)
    
    result = k_means_v3.predict_harvest(
        roof_area=data.roof_area,
        roof_type=data.roof_type,
        soil_type=data.soil_type,
        rainfall=data.annual_rainfall,
    )
    
    # Override groundwater level with our prediction
    result["groundwater_level"] = groundwater_level
    
    return {
        "potential_harvest": result["potential_harvest"],
        "tank_volume": result["tank_volume"],
        "efficiency": result["efficiency"],
        "inertia": result["inertia"],
        "cost_estimation": result["cost_estimation"],
        "roi": result["roi"],
        "feasibility": result["feasibility"],
        "feasibility_description": result["feasibility_description"],
        "recommended_structures": result["recommended_structures"],
        "rainfall_distribution": result["rainfall_distribution"],
        "groundwater_level": groundwater_level,
    }


@app.post("/predict")
def predict(data: AssessmentInput):
    return _run_prediction(data)


@app.post("/calculate")
def calculate(data: AssessmentInput):
    return _run_prediction(data)


@app.get("/states-districts")
def get_states_districts():
    """Get list of all states and their districts"""
    try:
        return groundwater_predictor.get_states_districts()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching states and districts: {str(e)}")


@app.post("/groundwater")
def predict_groundwater(data: GroundwaterInput):
    """Predict groundwater level for a specific state and district"""
    try:
        result = groundwater_predictor.predict_groundwater_level(
            state=data.state,
            district=data.district,
            latitude=data.latitude,
            longitude=data.longitude
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting groundwater level: {str(e)}")


@app.get("/district-stats/{state}/{district}")
def get_district_stats(state: str, district: str):
    """Get historical statistics for a district"""
    try:
        stats = groundwater_predictor.get_district_statistics(state, district)
        if not stats:
            raise HTTPException(status_code=404, detail="District not found or no data available")
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching district statistics: {str(e)}")


# ✅ Accept both GET and HEAD for uptime monitors
@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {"ok": True}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
