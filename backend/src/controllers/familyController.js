import Family from "../models/familyModel.js";

// Create / update family record
export const saveFamily = async (req, res) => {
  try {
    const { name, location, members, goalLiters, savings, monthlyBreakdown, achievements } = req.body;

    const family = new Family({
      user: req.user.id,
      name,
      location,
      members,
      goalLiters,
      savings,
      monthlyBreakdown,
      achievements
    });

    await family.save();
    res.status(201).json(family);
  } catch (err) {
    console.error("Error saving family:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all families (for community dashboard)
export const getFamilies = async (req, res) => {
  try {
    const families = await Family.find().sort({ yearly: -1 });
    res.json(families);
  } catch (err) {
    console.error("Error fetching families:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single family by ID
export const getFamilyById = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id);
    if (!family) return res.status(404).json({ message: "Family not found" });
    res.json(family);
  } catch (err) {
    console.error("Error fetching family:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
