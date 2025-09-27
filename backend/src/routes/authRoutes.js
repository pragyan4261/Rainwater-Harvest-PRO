import express from 'express';
import { signup, login } from '../controllers/authController.js';
import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', auth, (req, res) => {
  res.json({ firstName: req.user.firstName , lastName: req.user.lastName, email: req.user.email });
});

export default router;
