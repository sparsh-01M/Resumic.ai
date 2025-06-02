import { User } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface LinkedInUserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  headline?: string;
  summary?: string;
  experience?: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  education?: Array<{
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string;
  }>;
  skills?: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();
  
  if (!response.ok) {
    return {
      error: data.message || 'Something went wrong',
    };
  }

  return { data };
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ResumeUploadResponse {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  atsScore?: number;
}

interface RegisterResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface LoginResponse {
  token: string;
  user: User;
}

export const api = {
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    return handleResponse<LoginResponse>(response);
  },

  async register(name: string, email: string, password: string): Promise<ApiResponse<RegisterResponse>> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    return handleResponse<RegisterResponse>(response);
  },

  async getProfile(token: string) {
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response);
  },

  async submitContactForm(formData: ContactFormData) {
    const response = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    return handleResponse(response);
  },

  // LinkedIn Authentication
  getLinkedInAuthUrl: async (): Promise<ApiResponse<{ url: string }>> => {
    try {
      const response = await fetch(`${API_URL}/auth/linkedin/url`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get LinkedIn auth URL');
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },

  handleLinkedInCallback: async (code: string): Promise<ApiResponse<LinkedInUserData>> => {
    try {
      const response = await fetch(`${API_URL}/auth/linkedin/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to authenticate with LinkedIn');
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },

  disconnectLinkedIn: async (): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_URL}/auth/linkedin/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to disconnect LinkedIn account');
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },

  getLinkedInProfile: async (): Promise<ApiResponse<LinkedInUserData>> => {
    try {
      const response = await fetch(`${API_URL}/auth/linkedin/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch LinkedIn profile');
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },

  uploadResume: async (file: File): Promise<ApiResponse<ResumeUploadResponse>> => {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch(`${API_URL}/resume/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload resume');
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },

  // Add more API methods as needed
}; 