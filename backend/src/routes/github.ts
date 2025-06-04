import express from 'express';
import { auth } from '../middleware/auth.js';
import { getGitHubAuthUrl, connectGitHubProfile, disconnectGitHubProfile } from '../controllers/github.js';

const router = express.Router();

// Get GitHub auth URL
router.get('/url', auth, getGitHubAuthUrl);

// Connect GitHub profile
router.post('/connect', auth, connectGitHubProfile);

// Disconnect GitHub profile
router.post('/disconnect', auth, disconnectGitHubProfile);

export default router; 