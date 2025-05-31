import { Request, Response } from 'express';
import { LinkedInService } from '../services/linkedin';
import { User } from '../models/User';
import { auth } from '../middleware/auth';

export const linkedInController = {
  // Get LinkedIn OAuth URL
  getAuthUrl: async (req: Request, res: Response) => {
    try {
      const url = LinkedInService.getAuthUrl();
      res.json({ url });
    } catch (error) {
      console.error('LinkedIn auth URL error:', error);
      res.status(500).json({ error: 'Failed to get LinkedIn auth URL' });
    }
  },

  // Handle LinkedIn OAuth callback
  handleCallback: async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
      }

      // Get user from auth middleware
      const user = await User.findById(req.user?.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get access token
      const accessToken = await LinkedInService.getAccessToken(code);

      // Get user data from LinkedIn
      const linkedInData = await LinkedInService.getUserData(accessToken);

      // Update user with LinkedIn data
      await LinkedInService.updateUserLinkedInData(user, linkedInData);

      res.json(linkedInData);
    } catch (error) {
      console.error('LinkedIn callback error:', error);
      res.status(500).json({ error: 'Failed to authenticate with LinkedIn' });
    }
  },

  // Get user's LinkedIn profile
  getProfile: async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.user?.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.linkedInData) {
        return res.status(404).json({ error: 'LinkedIn not connected' });
      }

      res.json(user.linkedInData);
    } catch (error) {
      console.error('LinkedIn profile error:', error);
      res.status(500).json({ error: 'Failed to get LinkedIn profile' });
    }
  },

  // Disconnect LinkedIn account
  disconnect: async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.user?.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove LinkedIn data
      user.linkedInId = undefined;
      user.linkedInData = undefined;
      await user.save();

      res.json({ message: 'LinkedIn account disconnected successfully' });
    } catch (error) {
      console.error('LinkedIn disconnect error:', error);
      res.status(500).json({ error: 'Failed to disconnect LinkedIn account' });
    }
  },
}; 