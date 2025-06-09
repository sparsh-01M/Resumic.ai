import express from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/auth.js';
import { parseLinkedInProfile } from '../controllers/linkedin.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// LinkedIn routes
router.post('/linkedin/connect', auth, parseLinkedInProfile);

export default router; 