import mongoose from "mongoose";

const monthlyBreakdownSchema = new mongoose.Schema({
  month: { type: String, required: true },
  liters: { type: Number, required: true }
});

const familySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // link to registered user
    name: { type: String, required: true },
    location: { type: String, required: true },
    members: { type: Number, default: 1 },
    goalLiters: { type: Number, required: true },
    lastUpdated: { type: Date, default: Date.now },
    savings: {
      weekly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
      yearly: { type: Number, default: 0 }
    },
    monthlyBreakdown: [monthlyBreakdownSchema],
    achievements: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model("Family", familySchema);
