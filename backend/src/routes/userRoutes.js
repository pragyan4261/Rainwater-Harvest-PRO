import express from 'express';
import { getProfile, updateProfile } from '../controllers/UserController.js';
import auth from "../middlewares/authMiddleware.js"; 

const router = express.Router();



// Route to get user profile
router.get('/profile', auth, getProfile);

// Route to update user profile
router.put('/profile', auth, updateProfile);

export default router;