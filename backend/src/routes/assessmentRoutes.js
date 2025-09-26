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

    let mlData = { 
      potential_harvest: 0, 
      tank_volume: 0, 
      efficiency: 0, 
      inertia: 0,
      cost_estimation: {
        storage_tank: 0,
        recharge_pit: 0,
        gutters_pipes: 0,
        filtration_system: 0,
        installation: 0,
        total: 0
      },
      roi: {
        annual_savings: 0,
        payback_period: "N/A",
        water_saved: 0,
        runoff_reduction: "0%"
      },
      feasibility: "Not Assessed",
      feasibility_description: "Assessment pending",
      recommended_structures: [],
      rainfall_distribution: Array(12).fill(0),
      groundwater_level: 0
    };
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
      costEstimation: {
        storageTank: mlData.cost_estimation?.storage_tank || 0,
        rechargePit: mlData.cost_estimation?.recharge_pit || 0,
        guttersPipes: mlData.cost_estimation?.gutters_pipes || 0,
        filtrationSystem: mlData.cost_estimation?.filtration_system || 0,
        installation: mlData.cost_estimation?.installation || 0,
        total: mlData.cost_estimation?.total || 0,
        currency: mlData.cost_estimation?.currency || 'INR'
      },
      roi: {
        annualSavings: mlData.roi?.annual_savings || 0,
        paybackPeriod: mlData.roi?.payback_period || "N/A",
        waterSaved: mlData.roi?.water_saved || 0,
        runoffReduction: mlData.roi?.runoff_reduction || "0%",
        currency: mlData.roi?.currency || 'INR'
      },
      feasibility: mlData.feasibility || "Not Assessed",
      feasibilityDescription: mlData.feasibility_description || "Assessment pending",
      recommendedStructures: mlData.recommended_structures || [],
      rainfallDistribution: mlData.rainfall_distribution || Array(12).fill(0),
      groundwaterLevel: mlData.groundwater_level || 0,
      currency: 'INR',  // Overall currency indicator
      modelVersion: 'ML_trained_indian_data'  // Indicate we're using ML model
    });
  } catch (err) {
    console.error("Error fetching assessment:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
