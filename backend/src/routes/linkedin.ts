import express from 'express';
import { parseLinkedInProfile, disconnectLinkedInProfile } from '../controllers/linkedin.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/parse-profile', auth, parseLinkedInProfile);
router.post('/disconnect', auth, disconnectLinkedInProfile);

export default router; 