import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { saveAssessment } from "../controllers/assessmentController.js";
import Assessment from "../models/assessmentModel.js";
import fetch from "node-fetch";

const router = express.Router();

// Save new assessment
router.post("/", auth, saveAssessment);

// ✅ Get all assessments (for Reports.tsx)
router.get("/", auth, async (req, res) => {
  try {
    const assessments = await Assessment.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(assessments);
  } catch (err) {
    console.error("Error fetching assessments:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get latest assessment
router.get("/latest", auth, async (req, res) => {
  try {
    const assessment = await Assessment.findOne({ user: req.user.id })
      .sort({ createdAt: -1 });

    if (!assessment) {
      return res.status(404).json({ message: "No assessment found" });
    }

    const mlBase = process.env.ML_SERVICE_URL;
    if (!mlBase) {
      return res.status(502).json({ message: "ML service URL not configured" });
    }

    const trimmedBase = mlBase.replace(/\/+$/, "");
    const mlUrl = /(\/calculate|\/predict)$/i.test(trimmedBase)
      ? trimmedBase
      : `${trimmedBase}/calculate`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    let mlData = { potential_harvest: 0, tank_volume: 0, efficiency: 0, inertia: 0 };
    try {
      const mlResponse = await fetch(mlUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roof_area: assessment.roofArea,
          annual_rainfall: assessment.rainfall,
          roof_type: assessment.roofType,
          soil_type: assessment.soilType,
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!mlResponse.ok) {
        const text = await mlResponse.text();
        return res.status(502).json({ message: "ML service error", details: text });
      }
      mlData = await mlResponse.json();
    } catch (e) {
      clearTimeout(timeout);
      return res.status(502).json({
        message: "ML service unreachable",
        details: e.message,
      });
    }

    res.json({
      ...assessment.toObject(),
      potentialHarvest: mlData.potential_harvest || 0,
      tankVolume: mlData.tank_volume || 0,
      efficiency: mlData.efficiency || 0,
      inertia: mlData.inertia || 0,
    });
  } catch (err) {
    console.error("Error fetching assessment:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
