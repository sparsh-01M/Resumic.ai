import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { LinkedInData } from '../models/LinkedInData.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Use VITE_GEMINI_API_KEY as specified
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const parseLinkedInProfile = async (req: Request, res: Response) => {
  try {
    const { profileUrl } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!profileUrl) {
      return res.status(400).json({ error: 'LinkedIn profile URL is required' });
    }

    if (!GEMINI_API_KEY) {
      console.error('Gemini API key is missing');
      return res.status(500).json({ error: 'AI service is not configured properly' });
    }

    console.log('\n=== LinkedIn Profile Parsing Started ===');
    console.log(`User ID: ${userId}`);
    console.log(`Profile URL: ${profileUrl}`);
    console.log('Using Gemini API Key:', GEMINI_API_KEY.substring(0, 5) + '...');

    try {
      console.log('Initializing Gemini model...');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `Analyze this LinkedIn profile URL and extract the following information in JSON format. Return ONLY the raw JSON object without any markdown formatting or code blocks:
      {
        "name": "Full name",
        "headline": "Current job title/headline",
        "summary": "Profile summary/about section",
        "experience": [
          {
            "title": "Job title",
            "company": "Company name",
            "duration": "Duration of employment",
            "description": "Job description/responsibilities"
          }
        ],
        "education": [
          {
            "school": "School name",
            "degree": "Degree name",
            "field": "Field of study",
            "duration": "Duration of education"
          }
        ],
        "skills": ["List of skills"],
        "languages": ["List of languages"]
      }
      
      LinkedIn Profile URL: ${profileUrl}
      
      Note: Extract only the information that is publicly visible. If any section is not available, leave it as an empty array or null.
      Important: Return ONLY the raw JSON object, no markdown formatting, no code blocks, no additional text.`;

      console.log('Sending request to Gemini API...');
      const result = await model.generateContent(prompt);
      console.log('Received response from Gemini API');
      
      const response = await result.response;
      const responseText = response.text();
      console.log('Raw response:', responseText);
      
      let parsedData;
      try {
        // Clean the response text by removing markdown code block markers if present
        const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
        parsedData = JSON.parse(cleanJson);
        console.log('Successfully parsed JSON response');
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Raw response text:', responseText);
        return res.status(500).json({
          error: 'Failed to parse AI response',
          details: 'The AI response was not in valid JSON format'
        });
      }

      console.log('\nParsed LinkedIn Data:');
      console.log(JSON.stringify(parsedData, null, 2));

      // After successful parsing, update both models
      const session = await User.startSession();
      try {
        await session.withTransaction(async () => {
          // Update User model
          const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
              $set: {
                linkedInProfile: profileUrl,
                linkedInData: parsedData,
                linkedInConnected: true,
                linkedInLastUpdated: new Date()
              }
            },
            { new: true, session }
          );

          // Update or create LinkedInData model
          await LinkedInData.findOneAndUpdate(
            { userId },
            {
              $set: {
                profileUrl,
                data: parsedData,
                lastUpdated: new Date()
              }
            },
            { 
              upsert: true, 
              new: true,
              session
            }
          );

          console.log('\n✅ Successfully saved LinkedIn data to both models');
          console.log('Updated user document:', {
            id: updatedUser?._id,
            name: updatedUser?.name,
            email: updatedUser?.email,
            linkedInProfile: updatedUser?.linkedInProfile,
            linkedInConnected: updatedUser?.linkedInConnected,
            linkedInLastUpdated: updatedUser?.linkedInLastUpdated
          });
        });
      } finally {
        await session.endSession();
      }

      res.json({
        success: true,
        data: parsedData
      });

    } catch (geminiError) {
      console.error('Gemini API Error Details:', {
        name: geminiError.name,
        message: geminiError.message,
        stack: geminiError.stack,
        cause: geminiError.cause
      });
      return res.status(500).json({
        error: 'Failed to analyze LinkedIn profile',
        details: geminiError instanceof Error ? geminiError.message : 'Unknown Gemini API error'
      });
    }

  } catch (error) {
    console.error('Error parsing LinkedIn profile:', error);
    res.status(500).json({
      error: 'Failed to parse LinkedIn profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const disconnectLinkedInProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const session = await User.startSession();
    try {
      await session.withTransaction(async () => {
        // Update User model
        const user = await User.findByIdAndUpdate(
          userId,
          {
            $set: {
              linkedInProfile: undefined,
              linkedInData: undefined,
              linkedInConnected: false,
              linkedInLastUpdated: undefined
            }
          },
          { new: true, session }
        );

        if (!user) {
          throw new Error('User not found');
        }

        // Delete LinkedInData document
        await LinkedInData.findOneAndDelete(
          { userId },
          { session }
        );

        console.log('\n=== LinkedIn Profile Disconnected ===');
        console.log(`User ID: ${userId}`);
        console.log('✅ Successfully removed LinkedIn data from both models');
      });
    } finally {
      await session.endSession();
    }

    res.json({
      success: true,
      message: 'LinkedIn profile disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting LinkedIn profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect LinkedIn profile'
    });
  }
}; 