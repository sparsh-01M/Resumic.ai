import express from 'express';
import { parseGitHubProfile } from '../controllers/github.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Parse GitHub profile (protected route)
router.post('/parse', auth, parseGitHubProfile);

export default router; 