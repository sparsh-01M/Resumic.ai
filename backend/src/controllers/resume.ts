import { Request, Response } from 'express';
import { User, IUser, ParsedResumeData } from '../models/User.js';
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

export const saveParsedResume = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const parsedData: ParsedResumeData = req.body;
    console.log('Saving parsed resume data for user:', userId);
    console.log('Data summary:', {
      name: parsedData.name,
      email: parsedData.email,
      experienceCount: parsedData.experience?.length || 0,
      educationCount: parsedData.education?.length || 0,
      projectsCount: parsedData.projects?.length || 0,
      skillsCount: parsedData.skills?.length || 0
    });

    // Clean up the data before saving
    const cleanedData = {
      name: parsedData.name,
      email: parsedData.email,
      phone: parsedData.phone || undefined,
      location: parsedData.location || undefined,
      summary: parsedData.summary || undefined,
      experience: parsedData.experience?.map(exp => ({
        company: exp.company,
        position: exp.position,
        duration: exp.duration,
        description: exp.description || undefined
      })) || [],
      education: parsedData.education?.map(edu => ({
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field || undefined,
        graduationYear: edu.graduationYear,
        startYear: edu.startYear || undefined
      })) || [],
      certifications: parsedData.certifications?.map(cert => ({
        name: cert.name,
        issuer: cert.issuer,
        date: cert.date || undefined,
        url: cert.url || undefined
      })) || [],
      achievements: parsedData.achievements?.map(achievement => ({
        title: achievement.title,
        type: achievement.type,
        date: achievement.date || undefined,
        description: achievement.description,
        position: achievement.position || undefined,
        organization: achievement.organization || undefined,
        url: achievement.url || undefined
      })) || [],
      projects: parsedData.projects?.map(project => ({
        name: project.name,
        description: project.description,
        technologies: project.technologies || [],
        duration: project.duration || undefined,
        url: project.url || undefined
      })) || [],
      skills: parsedData.skills || []
    };

    // Update user with parsed resume data, but don't update email
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name: cleanedData.name,
          skills: cleanedData.skills,
          parsedResume: {
            ...cleanedData,
            parsedAt: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      console.log('User not found after update');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Successfully saved parsed resume data to MongoDB');
    console.log('Updated user document:', {
      id: user._id,
      name: user.name,
      email: user.email,
      skillsCount: user.skills.length,
      parsedAt: user.parsedResume?.parsedAt
    });

    res.json({
      success: true,
      message: 'Resume data saved successfully',
      data: {
        name: user.name,
        email: user.email,
        skills: user.skills,
        parsedAt: user.parsedResume?.parsedAt
      }
    });
  } catch (error) {
    console.error('Error saving parsed resume data:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to save resume data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 