import axios from 'axios';
import { User, IUser } from '../models/User.js';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:5173/auth/linkedin/callback';
const LINKEDIN_SCOPE = 'r_liteprofile r_emailaddress r_basicprofile';

interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
}

interface LinkedInProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: {
    displayImage: string;
  };
  emailAddress?: string;
  headline?: string;
  summary?: string;
}

export class LinkedInService {
  static getAuthUrl(): string {
    if (!LINKEDIN_CLIENT_ID) {
      console.error('LinkedIn Client ID is not set in environment variables');
      throw new Error('LinkedIn Client ID is not configured');
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: LINKEDIN_CLIENT_ID,
      redirect_uri: LINKEDIN_REDIRECT_URI,
      scope: LINKEDIN_SCOPE,
      state: Math.random().toString(36).substring(7), // Random state for security
    });

    const url = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    console.log('Generated LinkedIn OAuth URL:', url);
    return url;
  }

  static async getAccessToken(code: string): Promise<string> {
    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID!,
        client_secret: LINKEDIN_CLIENT_SECRET!,
      });

      const response = await axios.post<LinkedInTokenResponse>(
        'https://www.linkedin.com/oauth/v2/accessToken',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('LinkedIn token error:', error);
      throw new Error('Failed to get LinkedIn access token');
    }
  }

  static async getProfile(accessToken: string): Promise<LinkedInProfileResponse> {
    try {
      const response = await axios.get<LinkedInProfileResponse>(
        'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams),emailAddress,headline,summary)',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('LinkedIn profile error:', error);
      throw new Error('Failed to get LinkedIn profile');
    }
  }

  static async getEmail(accessToken: string): Promise<string> {
    try {
      const response = await axios.get<{ emailAddress: string }>(
        'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data.emailAddress;
    } catch (error) {
      console.error('LinkedIn email error:', error);
      throw new Error('Failed to get LinkedIn email');
    }
  }

  static async getExperience(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(
        'https://api.linkedin.com/v2/positions?q=member&projection=(elements*(title,company,startDate,endDate,description))',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data.elements || [];
    } catch (error) {
      console.error('LinkedIn experience error:', error);
      throw new Error('Failed to get LinkedIn experience');
    }
  }

  static async getEducation(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(
        'https://api.linkedin.com/v2/education?q=member&projection=(elements*(school,degree,fieldOfStudy,startDate,endDate))',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data.elements || [];
    } catch (error) {
      console.error('LinkedIn education error:', error);
      throw new Error('Failed to get LinkedIn education');
    }
  }

  static async getSkills(accessToken: string): Promise<string[]> {
    try {
      const response = await axios.get(
        'https://api.linkedin.com/v2/skills?q=member&projection=(elements*(name))',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return (response.data.elements || []).map((skill: any) => skill.name);
    } catch (error) {
      console.error('LinkedIn skills error:', error);
      throw new Error('Failed to get LinkedIn skills');
    }
  }

  static async getCertifications(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(
        'https://api.linkedin.com/v2/certifications?q=member&projection=(elements*(name,authority,startDate))',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data.elements || [];
    } catch (error) {
      console.error('LinkedIn certifications error:', error);
      throw new Error('Failed to get LinkedIn certifications');
    }
  }

  static async getUserData(accessToken: string): Promise<any> {
    try {
      const [
        profile,
        email,
        experience,
        education,
        skills,
        certifications,
      ] = await Promise.all([
        this.getProfile(accessToken),
        this.getEmail(accessToken),
        this.getExperience(accessToken),
        this.getEducation(accessToken),
        this.getSkills(accessToken),
        this.getCertifications(accessToken),
      ]);

      return {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email,
        profilePicture: profile.profilePicture?.displayImage,
        headline: profile.headline,
        summary: profile.summary,
        experience,
        education,
        skills,
        certifications,
      };
    } catch (error) {
      console.error('LinkedIn user data error:', error);
      throw new Error('Failed to get LinkedIn user data');
    }
  }

  static async updateUserLinkedInData(user: IUser, linkedInData: any): Promise<void> {
    try {
      // Update user's LinkedIn data
      user.linkedInId = linkedInData.id;
      user.linkedInData = linkedInData;
      await user.save();
    } catch (error) {
      console.error('Error updating user LinkedIn data:', error);
      throw new Error('Failed to update LinkedIn data');
    }
  }
} 