import express from 'express';
import { linkedInController } from '../controllers/linkedin';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get LinkedIn OAuth URL
router.get('/url', auth, linkedInController.getAuthUrl);

// Handle LinkedIn OAuth callback
router.post('/callback', auth, linkedInController.handleCallback);

// Get user's LinkedIn profile
router.get('/profile', auth, linkedInController.getProfile);

// Disconnect LinkedIn account
router.post('/disconnect', auth, linkedInController.disconnect);

export default router; 