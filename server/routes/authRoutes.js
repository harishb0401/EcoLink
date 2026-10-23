import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe, updateProfile, logout, verifyRecyclerRegistration } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { registerValidationRules, loginValidationRules } from '../validators/authValidator.js';

const router = express.Router();

// Strict rate limiter for authentication endpoints to prevent brute-force attacks
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 auth requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Registry lookup rate limiter (generous to allow interactive typing)
const lookupRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: {
    success: false,
    message: 'Too many registration lookup attempts. Please try again in a few minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.get('/verify-registration', lookupRateLimiter, verifyRecyclerRegistration);
router.post('/register', authRateLimiter, registerValidationRules, validateRequest, register);
router.post('/login', authRateLimiter, loginValidationRules, validateRequest, login);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.post('/logout', logout);

export default router;

