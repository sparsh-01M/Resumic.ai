import { Request, Response } from 'express';
import { User, IUser } from '../models/User.js';
import { uploadToCloudinary } from '../services/cloudinary.js';

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
  user?: IUser;
}

export const uploadResume = async (req: RequestWithFile, res: Response) => {
  try {
    console.log('Starting resume upload...');
    console.log('Request file:', req.file);
    console.log('Request user:', req.user);

    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.user) {
      console.log('No user in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const file = req.file;
    console.log('File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      buffer: file.buffer ? 'Buffer present' : 'No buffer'
    });

    // Upload to Cloudinary
    console.log('Attempting Cloudinary upload...');
    const resumeUrl = await uploadToCloudinary(file);
    console.log('Cloudinary upload successful, URL:', resumeUrl);

    // Update user in database
    console.log('Updating user in database...');
    const user = (await User.findByIdAndUpdate(
      req.user?._id,
      {
        resumeUrl,
        resumeUploadedAt: new Date(),
      },
      { new: true }
    ).select('-password')) as IUser & { _id: string };

    if (!user) {
      console.log('User not found after update');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User updated successfully');
    // Return response in the format expected by the frontend
    res.json({
      id: user._id.toString(),
      title: file.originalname,
      url: resumeUrl,
      createdAt: user.resumeUploadedAt?.toISOString() || new Date().toISOString(),
      atsScore: 0, // TODO: Implement ATS scoring
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    res.status(500).json({ 
      error: 'Failed to upload resume',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 