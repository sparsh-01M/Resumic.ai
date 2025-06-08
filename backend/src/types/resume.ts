export interface TemplateResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  education: Array<{
    startDate: string;
    endDate: string;
    institution: string;
    degree: string;
    gpa?: string;
    coursework?: string[];
  }>;
  experience: Array<{
    startDate: string;
    endDate: string;
    title: string;
    company: string;
    location: string;
    highlights: string[];
  }>;
  projects: Array<{
    name: string;
    link?: string;
    date?: string;
    description: string[];
    technologies?: string;
  }>;
  skills: Array<{
    category: string;
    items: string;
  }>;
  updatedAt: Date;
} 