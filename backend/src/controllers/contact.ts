import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Contact } from '../models/Contact.js';

// Validation middleware
export const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
];

export const submitContact = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, email, subject, message } = req.body;

    // Create new contact message
    const contact = new Contact({
      name,
      email,
      subject,
      message,
    });

    await contact.save();

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to user

    res.status(201).json({
      message: 'Thank you for your message. We will get back to you soon.',
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ message: 'Error submitting contact form' });
  }
}; 