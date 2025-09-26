import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { saveFamily, getFamilies, getFamilyById } from "../controllers/familyController.js";

const router = express.Router();

// Save family
router.post("/", auth, saveFamily);

// Get all families (community dashboard)
router.get("/", getFamilies);

// Get one family
router.get("/:id", getFamilyById);

export default router;
