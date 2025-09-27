import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  dwellers: Number,
  phone: String,
  email: String,
  roofArea: Number,
  openSpace: Number,
  roofType: String,
  soilType: String,
  address: String,
  state: String,
  district: String,
  latitude: Number,
  longitude: Number,
  rainfall: Number,

  // ✅ ML result fields
  feasibility: String,
  feasibilityDescription: String, // Added
  potentialHarvest: Number,
  tankVolume: Number, // Added
  efficiency: Number, // Added
  inertia: Number, // Added
  recommendedStructures: [mongoose.Schema.Types.Mixed], // Changed to Mixed
  rainfallDistribution: [Number], // Added
  groundwaterLevel: Number, // Added
  aquiferInfo: mongoose.Schema.Types.Mixed, // Added
  currency: String, // Added
  modelVersion: String, // Added
  costEstimation: {
    storageTank: Number,
    rechargePit: Number,
    guttersPipes: Number,
    filtrationSystem: Number,
    installation: Number,
    total: Number,
    currency: String, // Added
  },
  roi: {
    annualSavings: Number,
    paybackPeriod: String,
    waterSaved: Number,
    runoffReduction: String,
    currency: String, // Added
  },
}, { timestamps: true });

const Assessment = mongoose.model("Assessment", assessmentSchema);
export default Assessment;
