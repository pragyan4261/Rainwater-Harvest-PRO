import express from 'express';
import passport from 'passport';
import { signup, login } from '../controllers/authController.js';
import auth from '../middlewares/authMiddleware.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.get('/me', auth, (req, res) => {
  res.json({ firstName: req.user.firstName , lastName: req.user.lastName, email: req.user.email });
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
const furl = process.env.FRONTEND_URL || 'http://localhost:5173';
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    res.redirect(`${furl}/signup?token=${token}`);

  }
);

export default router;