import { User } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
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

interface GitHubAuthUrlResponse {
  url: string;
}

interface GitHubProfileResponse {
  success: boolean;
  message: string;
}

interface LinkedInProfileResponse {
  success: boolean;
  message: string;
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

  async getGitHubAuthUrl(): Promise<ApiResponse<GitHubAuthUrlResponse>> {
    try {
      const response = await fetch(`${API_URL}/auth/github/url`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return handleResponse<GitHubAuthUrlResponse>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to get GitHub auth URL' };
    }
  },

  async connectGitHubProfile(githubUrl: string): Promise<ApiResponse<GitHubProfileResponse>> {
    try {
      const response = await fetch(`${API_URL}/auth/github/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ githubUrl }),
      });

      return handleResponse<GitHubProfileResponse>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to connect GitHub profile' };
    }
  },

  async connectLinkedInProfile(linkedinUrl: string): Promise<ApiResponse<LinkedInProfileResponse>> {
    try {
      const response = await fetch(`${API_URL}/auth/linkedin/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ linkedinUrl }),
      });

      return handleResponse<LinkedInProfileResponse>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to connect LinkedIn profile' };
    }
  },

  // Add more API methods as needed
}; 