import express from 'express';
import { submitContact, contactValidation } from '../controllers/contact.js';

const router = express.Router();

// Submit contact form
router.post('/', contactValidation, submitContact);

export default router; 