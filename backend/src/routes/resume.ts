import express from 'express';
import { uploadResume } from '../controllers/resume';
import { upload } from '../services/cloudinary';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Upload resume (protected route)
router.post('/upload', auth, upload.single('resume'), uploadResume);

export default router; 