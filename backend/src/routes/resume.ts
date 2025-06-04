import express from 'express';
import { uploadResume, saveParsedResume } from '../controllers/resume.js';
import { upload } from '../services/cloudinary.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Upload resume (protected route)
router.post('/upload', auth, upload.single('resume'), uploadResume);

// Save parsed resume data (protected route)
router.post('/save-parsed', auth, saveParsedResume);

export default router; 