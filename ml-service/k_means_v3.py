"""KMeans clustering on Bengaluru rainfall data with ML-based cost prediction.

This script:
1. Loads the rainfall dataset (yearly rows, monthly columns).
2. Cleans empty unnamed column and converts values to numeric.
3. Computes monthly means and total predicted annual rainfall.
4. Estimates potential collection for a given roof area.
5. Performs KMeans clustering on per-year monthly rainfall profile.
6. Uses ML model trained on Indian construction data for cost estimation.
7. Reduces dimensions with PCA for visualization.
8. Saves cluster plot to 'rainfall_clusters.png'.

Assumptions:
- The last empty column in CSV is dropped.
- Collection efficiency varies by roof type.
- ML model provides Indian cost estimates in INR.
"""

from __future__ import annotations
import sys
from time import time
import argparse
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline

# Add feature_format utilities path (per request)
sys.path.append("E:/Downloads/ud120-projects-master/ud120-projects-master/tools/")
from feature_format import featureFormat  # noqa: E402

# Import the new cost prediction model
try:
    from cost_prediction_model import get_cost_predictor
    ML_COST_MODEL_AVAILABLE = True
    print("ML cost prediction model loaded successfully!")
except ImportError as e:
    ML_COST_MODEL_AVAILABLE = False
    print(f"Warning: ML cost model not available: {e}")

DATA_PATH = Path(__file__).parent.parent / "ml-service" / "Bengaluru Rainfall Data.csv"

MONTH_ORDER = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]


def load_and_clean(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    # Drop empty / unnamed columns
    empty_cols = [c for c in df.columns if c.strip() == '' or c.lower().startswith('unnamed')]
    if empty_cols:
        df.drop(columns=empty_cols, inplace=True)
    # Rename first column to Year
    df.rename(columns={df.columns[0]: 'Year'}, inplace=True)
    # Ensure all expected month columns exist (intersect)
    month_cols_present = [c for c in MONTH_ORDER if c in df.columns]
    # Convert to numeric
    for c in month_cols_present:
        df[c] = pd.to_numeric(df[c], errors='coerce')
    df['Year'] = pd.to_numeric(df['Year'], errors='coerce')
    df.dropna(subset=['Year'], inplace=True)
    # Impute month NaNs with column means
    df[month_cols_present] = df[month_cols_present].apply(lambda col: col.fillna(col.mean()))
    df.reset_index(drop=True, inplace=True)
    return df[["Year"] + month_cols_present]


def rainfall_statistics(df: pd.DataFrame) -> dict:
    month_cols = [c for c in df.columns if c != 'Year']
    monthly_means = df[month_cols].mean()
    total_predicted = monthly_means.sum()
    roof_area_m2 = 30 * 0.3048 * 40 * 0.3048  # 111.483648 m2
    efficiency = 0.8
    expected_collection = total_predicted * roof_area_m2 * efficiency  # litres
    return {
        'monthly_means': monthly_means,
        'total_predicted_mm': total_predicted,
        'expected_collection_litres': expected_collection,
        'roof_area_m2': roof_area_m2,
        'efficiency': efficiency,
    }


def dataframe_to_feature_dict(df: pd.DataFrame) -> tuple[dict, list[str]]:
    """Convert dataframe to dictionary-of-dicts for featureFormat."""
    month_cols = [c for c in df.columns if c != 'Year']
    data_dict: dict = {}
    for _, row in df.iterrows():
        year_key = int(row['Year'])
        data_dict[year_key] = {m: float(row[m]) for m in month_cols}
    return data_dict, month_cols


def run_kmeans(X: np.ndarray, k: int = 3, random_state: int = 42):
    pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="mean")),
        ("scaler", StandardScaler()),
        ("kmeans", KMeans(n_clusters=k, n_init=10, max_iter=300, random_state=random_state))
    ])
    t0 = time()
    labels = pipeline.fit_predict(X)
    elapsed = time() - t0
    inertia = pipeline.named_steps['kmeans'].inertia_
    return pipeline, labels, inertia, elapsed


def plot_clusters(X: np.ndarray, labels: np.ndarray, outfile: str = 'rainfall_clusters.png') -> None:
    pca = PCA(n_components=2, random_state=42)
    X2 = pca.fit_transform(X)
    plt.figure(figsize=(8, 6))
    scatter = plt.scatter(X2[:, 0], X2[:, 1], c=labels, cmap='viridis', s=30, alpha=0.85)
    plt.title('KMeans Clusters of Yearly Rainfall Profiles (PCA 2D)')
    plt.xlabel('PC1')
    plt.ylabel('PC2')
    plt.colorbar(scatter, label='Cluster')
    plt.tight_layout()
    plt.savefig(outfile, dpi=150)
    plt.close()


def calculate_feasibility(potential_harvest, roof_area, soil_type):
    """
    Determine project feasibility based on harvest potential and conditions.
    """
    if potential_harvest > 5000 and roof_area > 50:
        feasibility = "Highly Feasible"
        description = "Excellent conditions for rainwater harvesting with high potential returns."
    elif potential_harvest > 2000 and roof_area > 25:
        feasibility = "Feasible"
        description = "Good conditions for rainwater harvesting with moderate returns."
    elif potential_harvest > 1000:
        feasibility = "Moderately Feasible"
        description = "Basic rainwater harvesting is possible but returns may be limited."
    else:
        feasibility = "Low Feasibility"
        description = "Limited potential due to small roof area or low rainfall."
    
    return feasibility, description


def get_recommended_structures(roof_type, soil_type, roof_area):
    """
    Recommend appropriate structures based on conditions.
    """
    structures = []
    
    # Always recommend storage tank
    structures.append({
        "name": "Storage Tank",
        "description": "Primary water storage system for collected rainwater."
    })
    
    # Recharge structures based on soil type
    if soil_type.lower() in ['sandy', 'loam']:
        structures.append({
            "name": "Recharge Pit",
            "description": "Ground infiltration system suitable for your soil type."
        })
    elif soil_type.lower() == 'clay':
        structures.append({
            "name": "Recharge Well",
            "description": "Deep infiltration system for clay soil conditions."
        })
    elif soil_type.lower() == 'rocky':
        structures.append({
            "name": "Recharge Shaft",
            "description": "Specialized system for rocky terrain with proper filtration."
        })
    
    # Roof-specific recommendations
    if roof_type.lower() in ['rcc', 'concrete']:
        structures.append({
            "name": "First Flush Diverter",
            "description": "Essential for concrete roofs to ensure water quality."
        })
    
    if roof_area > 100:
        structures.append({
            "name": "Distribution System",
            "description": "Multi-point collection system for large roof areas."
        })
    
    return structures


def estimate_groundwater_level(soil_type):
    """
    Estimate groundwater level based on soil type (simplified model).
    """
    levels = {
        'sandy': 8.5,    # Shallow groundwater
        'loam': 12.0,    # Moderate depth
        'clay': 15.5,    # Deeper groundwater
        'rocky': 18.0,   # Deepest groundwater
    }
    return levels.get(soil_type.lower(), 12.0)


def get_monthly_rainfall_distribution():
    """
    Get typical monthly rainfall distribution for Bengaluru (example data).
    Returns 12-month array in mm.
    """
    # Simplified Bengaluru rainfall pattern (mm per month)
    # Peak during monsoon (June-September)
    return [12, 8, 15, 45, 85, 165, 145, 135, 155, 95, 35, 18]


def calculate_cost_estimation(tank_volume_l, roof_area, soil_type, potential_harvest):
    """
    Calculate cost estimation for rainwater harvesting system using ML model trained on Indian data.
    Returns costs in Indian Rupees (INR).
    """
    if ML_COST_MODEL_AVAILABLE:
        try:
            # Use ML model for accurate cost prediction
            predictor = get_cost_predictor()
            
            # Get roof type from context (default to RCC if not available)
            roof_type = 'RCC'  # This should ideally be passed as parameter
            
            # Get ML-based cost estimation
            ml_cost_estimate = predictor.estimate_rwh_system_cost(
                roof_area_m2=roof_area,
                roof_type=roof_type,
                soil_type=soil_type,
                tank_volume_l=tank_volume_l
            )
            
            print(f"ML Model Cost Estimation (INR): ₹{ml_cost_estimate['total']:,.2f}")
            
            return {
                'storage_tank': ml_cost_estimate['storage_tank'],
                'recharge_pit': ml_cost_estimate['recharge_pit'],
                'gutters_pipes': ml_cost_estimate['gutters_pipes'],
                'filtration_system': ml_cost_estimate['filtration_system'],
                'installation': ml_cost_estimate['installation'],
                'total': ml_cost_estimate['total'],
                'currency': 'INR',
                'model_used': 'ML_trained'
            }
            
        except Exception as e:
            print(f"ML model failed, falling back to heuristic: {e}")
            return calculate_cost_estimation_fallback(tank_volume_l, roof_area, soil_type, potential_harvest)
    
    else:
        # Fallback to heuristic method
        return calculate_cost_estimation_fallback(tank_volume_l, roof_area, soil_type, potential_harvest)


def calculate_cost_estimation_fallback(tank_volume_l, roof_area, soil_type, potential_harvest):
    """
    Enhanced fallback cost estimation using detailed Indian market rates.
    All costs in Indian Rupees (INR).
    """
    # ===== STORAGE TANK COSTS =====
    # Tiered pricing based on tank size (Indian market rates)
    if tank_volume_l <= 1000:
        # Small plastic/fiberglass tanks
        tank_cost_per_liter = 35  # ₹35/L
        accessories_percentage = 0.12
    elif tank_volume_l <= 5000:
        # Medium reinforced plastic tanks
        tank_cost_per_liter = 42  # ₹42/L
        accessories_percentage = 0.15
    elif tank_volume_l <= 15000:
        # Large concrete/ferrocement tanks
        tank_cost_per_liter = 48  # ₹48/L
        accessories_percentage = 0.18
    else:
        # Very large RCC construction
        tank_cost_per_liter = 55  # ₹55/L
        accessories_percentage = 0.20
    
    tank_base_cost = tank_volume_l * tank_cost_per_liter
    tank_accessories = tank_base_cost * accessories_percentage
    storage_tank = tank_base_cost + tank_accessories
    
    # ===== RECHARGE PIT COSTS =====
    base_pit_cost = 12000  # ₹12,000 for standard recharge pit
    
    # Soil type multipliers (Indian conditions)
    soil_multipliers = {
        'sandy': 1.0,     # Easy excavation, natural infiltration
        'loam': 1.4,      # Moderate excavation + filter media
        'clay': 1.8,      # Difficult excavation + drainage layers
        'rocky': 2.5,     # Very difficult + specialized equipment
    }
    soil_multiplier = soil_multipliers.get(soil_type.lower(), 1.4)
    
    # Scale with roof area (larger catchment needs bigger pit)
    area_scaling = min(roof_area / 100, 3.0)  # Max 3x scaling
    
    # Additional components for Indian recharge pits
    excavation_cost = base_pit_cost * soil_multiplier * area_scaling
    filter_media = 3000 * area_scaling  # Gravel, sand, charcoal layers
    masonry_lining = 8000 * area_scaling  # Brick/stone lining
    
    recharge_pit = excavation_cost + filter_media + masonry_lining
    
    # ===== GUTTERS & PIPES COSTS =====
    # Estimate based on roof perimeter and drainage requirements
    estimated_perimeter = 4 * (roof_area ** 0.5)  # Rough square assumption
    
    # Indian PVC rates
    gutter_cost_per_meter = 450  # ₹450/m for quality PVC gutters
    pipe_cost_per_meter = 280    # ₹280/m for 4-6 inch pipes
    
    # Calculate requirements
    gutter_length = estimated_perimeter
    pipe_length = estimated_perimeter * 0.7  # Vertical + horizontal runs
    
    material_cost = (gutter_length * gutter_cost_per_meter + 
                    pipe_length * pipe_cost_per_meter)
    
    # Fittings, joints, supports (25% of material cost)
    fittings_cost = material_cost * 0.25
    
    gutters_pipes = material_cost + fittings_cost
    
    # ===== FILTRATION SYSTEM COSTS =====
    # Multi-stage filtration for Indian conditions
    basic_sand_filter = 8000    # ₹8,000 basic sand-gravel filter
    first_flush_diverter = 3500 # ₹3,500 first flush system (essential)
    
    # Additional filtration based on tank size
    if tank_volume_l > 5000:
        advanced_filtration = 12000  # Multi-stage system
        if tank_volume_l > 10000:
            uv_treatment = 6000      # UV sterilization for large systems
        else:
            uv_treatment = 0
    else:
        advanced_filtration = 0
        uv_treatment = 0
    
    filtration_system = (basic_sand_filter + first_flush_diverter + 
                        advanced_filtration + uv_treatment)
    
    # ===== INSTALLATION COSTS =====
    subtotal = storage_tank + recharge_pit + gutters_pipes + filtration_system
    
    # Installation complexity based on system size
    if roof_area < 100:
        installation_percentage = 0.16  # 16% for simple installations
        complexity = "Simple"
    elif roof_area < 300:
        installation_percentage = 0.18  # 18% for medium complexity
        complexity = "Medium"
    else:
        installation_percentage = 0.22  # 22% for complex installations
        complexity = "Complex"
    
    # Additional Indian costs
    transportation = subtotal * 0.03  # 3% for material transport
    supervision = subtotal * 0.02     # 2% for technical supervision
    
    installation = (subtotal * installation_percentage) + transportation + supervision
    
    # Total cost
    total = subtotal + installation
    
    return {
        'storage_tank': round(storage_tank, 2),
        'recharge_pit': round(recharge_pit, 2),
        'gutters_pipes': round(gutters_pipes, 2),
        'filtration_system': round(filtration_system, 2),
        'installation': round(installation, 2),
        'total': round(total, 2),
        'currency': 'INR',
        'model_used': 'enhanced_heuristic',
        'breakdown': {
            'tank_cost_per_liter': tank_cost_per_liter,
            'soil_multiplier': soil_multiplier,
            'installation_complexity': complexity,
            'system_size': 'Small' if tank_volume_l <= 1000 else 
                          'Medium' if tank_volume_l <= 5000 else
                          'Large' if tank_volume_l <= 15000 else 'Very Large'
        }
    }


def calculate_roi(potential_harvest, cost_estimation):
    """
    Calculate Return on Investment metrics for Indian market.
    """
    # Indian water pricing assumptions (in INR)
    water_cost_per_liter = 0.05  # ₹0.05 per liter (Indian municipal water rates)
    maintenance_cost_annual = 2000  # ₹2000 annual maintenance
    
    # Calculate annual savings
    annual_water_savings = potential_harvest * water_cost_per_liter
    net_annual_savings = annual_water_savings - maintenance_cost_annual
    
    # Payback period calculation
    total_cost = cost_estimation.get('total', 0)
    if net_annual_savings > 0 and total_cost > 0:
        payback_years = total_cost / net_annual_savings
        if payback_years < 1:
            payback_period = f"{int(payback_years * 12)} months"
        else:
            payback_period = f"{payback_years:.1f} years"
    else:
        payback_period = "Not applicable"
    
    # Environmental impact
    runoff_reduction = min(85, (potential_harvest / 10000) * 20)  # Percentage
    
    # Convert to display currency (show in INR for Indian market)
    currency = cost_estimation.get('currency', 'INR')
    
    return {
        'annual_savings': round(net_annual_savings, 2),
        'payback_period': payback_period,
        'water_saved': int(potential_harvest),
        'runoff_reduction': f"{runoff_reduction:.1f}%",
        'currency': currency,
        'water_cost_per_liter': water_cost_per_liter,
        'annual_water_bill_savings': round(annual_water_savings, 2)
    }


def predict_harvest(
    roof_area,
    roof_type,
    soil_type,
    rainfall,
    roof_slope=5.0,
    catchment_eff=None
):
    """
    Calculate potential harvestable water (litres/year) and recommended tank volume (litres).
    Now includes cost estimation and ROI calculations.
    """
    # Normalize inputs
    roof_type = roof_type.strip().lower()
    soil_type = soil_type.strip().lower()
    
    # Coefficient mapping
    base_coeffs = {
        'rcc': 0.85,
        'concrete': 0.85,
        'tile': 0.75,
        'corrugated': 0.70,
        'sheet': 0.70,
        'asbestos': 0.65,
        'poor': 0.65,
        'thatch': 0.60,
        'metal': 0.80,
    }
    coeff = base_coeffs.get(roof_type, 0.70)
    
    # Adjust for slope: mild bonus up to +5% if slope between 5 and 25 degrees
    if 5 <= roof_slope <= 25:
        coeff *= 1.03
    coeff = min(coeff, 0.9)

    # Use provided catchment_eff if given, else use coeff
    if catchment_eff is not None:
        catchment_eff = max(0.0, min(1.0, catchment_eff))
    else:
        catchment_eff = coeff

    # Calculate potential harvest
    potential_water_save_l_per_year = rainfall * roof_area * catchment_eff
    # Calculate recommended tank volume (e.g., 1.5 months of average collection)
    avg_monthly_collection = potential_water_save_l_per_year / 12.0
    tank_volume_l = avg_monthly_collection * 1.5

    # Use the calculated catchment_eff as efficiency
    efficiency = catchment_eff * 100

    # --- Get inertia from run_kmeans ---
    df = load_and_clean(DATA_PATH)
    data_dict, month_cols = dataframe_to_feature_dict(df)
    X = featureFormat(data_dict, month_cols, remove_NaN=True, remove_all_zeroes=False)
    pipeline, labels, inertia, elapsed = run_kmeans(X, k=3)

    # Calculate cost estimation and ROI (now with ML model)
    if ML_COST_MODEL_AVAILABLE:
        try:
            predictor = get_cost_predictor()
            cost_estimation = predictor.estimate_rwh_system_cost(
                roof_area_m2=roof_area,
                roof_type=roof_type,
                soil_type=soil_type,
                tank_volume_l=tank_volume_l
            )
            # Ensure consistent format
            cost_estimation = {
                'storage_tank': cost_estimation['storage_tank'],
                'recharge_pit': cost_estimation['recharge_pit'], 
                'gutters_pipes': cost_estimation['gutters_pipes'],
                'filtration_system': cost_estimation['filtration_system'],
                'installation': cost_estimation['installation'],
                'total': cost_estimation['total'],
                'currency': cost_estimation.get('currency', 'INR'),
                'model_used': 'ML_trained'
            }
        except Exception as e:
            print(f"ML model failed, using fallback: {e}")
            cost_estimation = calculate_cost_estimation_fallback(
                tank_volume_l, roof_area, soil_type, potential_water_save_l_per_year
            )
    else:
        cost_estimation = calculate_cost_estimation_fallback(
            tank_volume_l, roof_area, soil_type, potential_water_save_l_per_year
        )
    
    roi = calculate_roi(potential_water_save_l_per_year, cost_estimation)
    
    # Calculate feasibility
    feasibility, feasibility_description = calculate_feasibility(
        potential_water_save_l_per_year, roof_area, soil_type
    )
    
    # Get recommendations and additional data
    recommended_structures = get_recommended_structures(roof_type, soil_type, roof_area)
    rainfall_distribution = get_monthly_rainfall_distribution()
    groundwater_level = estimate_groundwater_level(soil_type)

    return {
        "potential_harvest": potential_water_save_l_per_year,
        "tank_volume": tank_volume_l,
        "efficiency": efficiency,
        "inertia": inertia,
        "cost_estimation": cost_estimation,
        "roi": roi,
        "feasibility": feasibility,
        "feasibility_description": feasibility_description,
        "recommended_structures": recommended_structures,
        "rainfall_distribution": rainfall_distribution,
        "groundwater_level": groundwater_level
    }


def main():
    parser = argparse.ArgumentParser(description="Rainwater harvesting analytics + clustering")
    parser.add_argument("--roof-area", type=float, required=False, default=None, help="Roof catchment area in square meters (if omitted, uses 30x40 ft assumption ~111.48 m2)")
    parser.add_argument("--roof-type", type=str, required=False, default="RCC", help="Roof type: RCC, Tile, Corrugated, Asbestos, Thatch, Metal")
    parser.add_argument("--soil-type", type=str, required=False, default="Loam", help="Soil type: Sandy, Loam, Clay, Rocky")
    parser.add_argument("--roof-slope", type=float, required=False, default=5.0, help="Roof slope in degrees (approx; affects runoff)")
    parser.add_argument("--catchment-eff", type=float, required=False, default=None, help="Override catchment efficiency (0-1). If not set derived from roof type.")
    parser.add_argument("--annual-rainfall", type=float, required=False, default=None, help="Override annual rainfall (mm). If not set uses dataset mean.")
    parser.add_argument("--clusters", type=int, default=3, help="Number of KMeans clusters (default 3)")
    parser.add_argument("--no-plot", action="store_true", help="Skip cluster plot generation")
    args = parser.parse_args()

    # Load and stats
    df = load_and_clean(DATA_PATH)
    stats = rainfall_statistics(df)
    dataset_mean_rainfall = stats['total_predicted_mm']

    print('Monthly mean rainfall (mm) [Jan..Dec]:')
    print(stats['monthly_means'].reindex(MONTH_ORDER).tolist())
    print(f"Predicted average annual rainfall (dataset mean): {dataset_mean_rainfall:.2f} mm")

    # Determine inputs ----------------------------------------------------
    roof_area_m2 = args.roof_area if args.roof_area is not None else stats['roof_area_m2']
    annual_rainfall_mm = args.annual_rainfall if args.annual_rainfall is not None else dataset_mean_rainfall
    roof_type = args.roof_type.strip().lower()
    soil_type = args.soil_type.strip().lower()
    roof_slope = max(args.roof_slope, 0.0)

    # Coefficient mapping
    base_coeffs = {
        'rcc': 0.85,
        'concrete': 0.85,
        'tile': 0.75,
        'corrugated': 0.70,
        'sheet': 0.70,
        'asbestos': 0.65,
        'poor': 0.65,
        'thatch': 0.60,
        'metal': 0.80,
    }
    coeff = base_coeffs.get(roof_type, 0.70)
    # Adjust for slope: mild bonus up to +5% if slope between 5 and 25 degrees
    if 5 <= roof_slope <= 25:
        coeff *= 1.03
    coeff = min(coeff, 0.9)

    if args.catchment_eff is not None:
        catchment_eff = max(0.0, min(1.0, args.catchment_eff))
    else:
        catchment_eff = coeff

    potential_water_save_l_per_year = annual_rainfall_mm * roof_area_m2 * catchment_eff

    # Simple heuristic for recommended tank sizing:
    # - Provide storage for 1.5 months of average collection (i.e., annual / 8)
    avg_monthly_collection = potential_water_save_l_per_year / 12.0
    tank_volume_l = avg_monthly_collection * 1.5  # buffer factor

    # Soil type advisory (could later adjust infiltration or recharge component)
    soil_infiltration_notes = {
        'sandy': 'High infiltration potential; consider recharge pit sized appropriately.',
        'loam': 'Balanced infiltration; standard filtration adequate.',
        'clay': 'Low infiltration; prioritize storage & overflow management.',
        'rocky': 'Variable infiltration; assess need for silt traps and recharge shafts.'
    }
    soil_note = soil_infiltration_notes.get(soil_type, 'Soil type not recognized; using generic assumptions.')

    print("\nUser Input / Derived Parameters:")
    print(f"Roof area: {roof_area_m2:.2f} m^2")
    print(f"Roof type: {args.roof_type} (derived efficiency {catchment_eff:.2f})")
    print(f"Annual rainfall used: {annual_rainfall_mm:.2f} mm")
    print(f"Roof slope (deg): {roof_slope:.1f}")
    print(f"Soil type: {args.soil_type} -> {soil_note}")

    print("\nHarvest Potential:")
    print(f"Potential harvestable water (annual): {potential_water_save_l_per_year:,.2f} litres")
    print(f"Recommended tank volume: {tank_volume_l:,.2f} litres (approx 1.5 months storage)")

    # Clustering -----------------------------------------------------------
    data_dict, month_cols = dataframe_to_feature_dict(df)
    X = featureFormat(data_dict, month_cols, remove_NaN=True, remove_all_zeroes=False)
    if np.isnan(X).any():
        print("Warning: NaNs detected after featureFormat; they will be imputed in pipeline.")
    pipeline, labels, inertia, elapsed = run_kmeans(X, k=args.clusters)
    print(f"\nKMeans trained in {elapsed:.3f} s; inertia={inertia:.2f}; clusters={args.clusters}")
    unique, counts = np.unique(labels, return_counts=True)
    print('Cluster distribution (cluster: count):', dict(zip(unique, counts)))
    if not args.no_plot:
        plot_clusters(X, labels)
        print("Cluster plot saved to 'rainfall_clusters.png'")

    # Summary lines matching earlier style if needed
    print(f"\nCollection efficiency (final): {catchment_eff*100:.1f}%")
    print(f"Expected annual collection (computed): {potential_water_save_l_per_year:.2f} litres")


if __name__ == '__main__':
    main()
