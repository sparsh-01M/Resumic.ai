import { Types } from 'mongoose';
import { ParsedResumeData } from '../services/gemini';

interface MongoResumeData {
  // Basic Info
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    [key: string]: any; // Allow additional fields
  };

  // Education
  education?: Array<{
    school?: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    gpa?: number | string;
    courses?: string[];
    [key: string]: any;
  }>;

  // Work Experience
  workExperience?: Array<{
    company?: string;
    position?: string;
    location?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    description?: string[];
    achievements?: string[];
    [key: string]: any;
  }>;

  // Projects
  projects?: Array<{
    name?: string;
    description?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    url?: string;
    technologies?: string[];
    [key: string]: any;
  }>;

  // Skills
  skills?: {
    technical?: string[];
    soft?: string[];
    languages?: string[];
    [key: string]: any;
  };

  // Additional sections that might exist in MongoDB
  [key: string]: any;
}

interface TemplateResumeData {
  name: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  github: string;
  
  education: Array<{
    startDate: string;
    endDate: string;
    institution: string;
    degree: string;
    gpa?: string;
    coursework?: string;
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
}

// Interface for LinkedIn data
interface LinkedInData {
  name: string;
  headline: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    duration: string;
  }>;
  skills: string[];
  languages: string[];
}

// Interface for GitHub data
interface GitHubData {
  username: string;
  repositories: Array<{
    name: string;
    description: string;
    languages: string[];
    url: string;
    stars: number;
    forks: number;
  }>;
  contributions: number;
  topLanguages: Array<{
    name: string;
    percentage: number;
  }>;
}

// Main transformation function
export function transformResumeData(
  resumeData: ParsedResumeData,
  linkedInData?: LinkedInData,
  githubData?: GitHubData
): TemplateResumeData {
  // Start with base resume data
  const transformed: TemplateResumeData = {
    name: resumeData.name,
    email: resumeData.email,
    phone: resumeData.phone || '',
    location: resumeData.location || '',
    website: '',
    linkedin: '',
    github: '',
    education: resumeData.education.map(edu => ({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: edu.startYear || '',
      endDate: edu.graduationYear,
      gpa: undefined,
      coursework: undefined
    })),
    experience: resumeData.experience.map(exp => {
      const { startDate, endDate } = parseDuration(exp.duration);
      return {
        company: exp.company,
        title: exp.position,
        location: '',
        startDate,
        endDate,
        highlights: exp.description ? [exp.description] : []
      };
    }),
    projects: resumeData.projects.map(proj => ({
      name: proj.name,
      description: [proj.description],
      technologies: proj.technologies?.join(', ') || undefined,
      link: proj.url
    })),
    skills: mergeSkills(
      resumeData.skills,
      linkedInData?.skills || [],
      githubData?.topLanguages.map(lang => lang.name) || []
    ).map(skill => ({
      category: skill.category,
      items: skill.items.join(', ')
    }))
  };

  // Merge LinkedIn data if available
  if (linkedInData) {
    // Merge experience
    const linkedInExperience = linkedInData.experience.map(exp => {
      const { startDate, endDate } = parseDuration(exp.duration);
      return {
        company: exp.company,
        title: exp.title,
        location: '',
        startDate,
        endDate,
        highlights: [exp.description]
      };
    });

    // Merge unique experiences
    transformed.experience = [...transformed.experience, ...linkedInExperience]
      .filter((exp, index, self) => 
        index === self.findIndex(e => 
          e.company === exp.company && 
          e.title === exp.title
        )
      );

    // Add languages as a skill category if available
    if (linkedInData.languages.length > 0) {
      transformed.skills.push({
        category: 'Languages',
        items: linkedInData.languages.join(', ')
      });
    }
  }

  // Merge GitHub data if available
  if (githubData) {
    // Add GitHub repositories as projects
    const githubProjects = githubData.repositories.map(repo => ({
      name: repo.name,
      description: [repo.description || ''],
      technologies: repo.languages.join(', '),
      link: repo.url
    }));

    // Merge unique projects
    transformed.projects = [...transformed.projects, ...githubProjects]
      .filter((proj, index, self) => 
        index === self.findIndex(p => p.name === proj.name)
      );
  }

  return transformed;
}

// Helper function to parse duration strings into start and end dates
function parseDuration(duration: string): { startDate: string; endDate: string } {
  // Handle "Present" or "Current" cases
  if (duration.toLowerCase().includes('present') || duration.toLowerCase().includes('current')) {
    const parts = duration.split(' - ');
    if (parts.length === 2) {
      return {
        startDate: parts[0].trim(),
        endDate: 'Present'
      };
    }
  }

  // Handle date ranges (e.g., "Jan 2020 - Dec 2022")
  const rangeMatch = duration.match(/([A-Za-z]+\s+\d{4})\s*-\s*([A-Za-z]+\s+\d{4}|Present)/);
  if (rangeMatch) {
    return {
      startDate: rangeMatch[1],
      endDate: rangeMatch[2]
    };
  }

  // Handle single dates (e.g., "2020")
  const yearMatch = duration.match(/\d{4}/);
  if (yearMatch) {
    return {
      startDate: yearMatch[0],
      endDate: yearMatch[0]
    };
  }

  // Default case
  return {
    startDate: duration,
    endDate: 'Present'
  };
}

// Helper function to merge skills from different sources
function mergeSkills(resumeSkills: string[], linkedInSkills: string[], githubLanguages: string[]): Array<{ category: string; items: string[] }> {
  const allSkills = new Set([...resumeSkills, ...linkedInSkills]);
  const programmingLanguages = new Set(githubLanguages);
  
  // Categorize skills
  const categories: { [key: string]: Set<string> } = {
    'Programming Languages': new Set(),
    'Technologies': new Set(),
    'Soft Skills': new Set(),
    'Languages': new Set()
  };

  // Add programming languages
  programmingLanguages.forEach(lang => {
    categories['Programming Languages'].add(lang);
  });

  // Categorize other skills
  allSkills.forEach(skill => {
    if (!programmingLanguages.has(skill)) {
      // Add to Technologies by default
      categories['Technologies'].add(skill);
    }
  });

  // Convert to required format
  return Object.entries(categories)
    .filter(([_, skills]) => skills.size > 0)
    .map(([category, skills]) => ({
      category,
      items: Array.from(skills)
    }));
}

// Helper function to normalize data from MongoDB
export function normalizeMongoData(data: any): TemplateResumeData {
  // If data is already in the expected format, transform it directly
  if (data.parsedResume || data.linkedInData || data.githubData) {
    return transformResumeData(
      data.parsedResume || data,
      data.linkedInData,
      data.githubData
    );
  }

  // Otherwise, normalize the data first
  const normalized: MongoResumeData = {
    personalInfo: {},
    education: [],
    workExperience: [],
    projects: [],
    skills: {}
  };

  // Try to extract basic info
  if (data.name || data.email || data.phone) {
    normalized.personalInfo = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      location: data.location,
      website: data.website,
      linkedin: data.linkedin,
      github: data.github
    };
  }

  // Try to extract education
  if (Array.isArray(data.education)) {
    normalized.education = data.education;
  } else if (data.school || data.degree) {
    normalized.education = [{
      school: data.school,
      degree: data.degree,
      fieldOfStudy: data.fieldOfStudy,
      startDate: data.startDate,
      endDate: data.endDate,
      gpa: data.gpa,
      courses: data.courses
    }];
  }

  // Try to extract work experience
  if (Array.isArray(data.experience)) {
    normalized.workExperience = data.experience;
  } else if (data.company || data.position) {
    normalized.workExperience = [{
      company: data.company,
      position: data.position,
      location: data.location,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description,
      achievements: data.achievements
    }];
  }

  // Try to extract projects
  if (Array.isArray(data.projects)) {
    normalized.projects = data.projects;
  } else if (data.projectName || data.projectDescription) {
    normalized.projects = [{
      name: data.projectName,
      description: data.projectDescription,
      startDate: data.projectStartDate,
      endDate: data.projectEndDate,
      url: data.projectUrl,
      technologies: data.projectTechnologies
    }];
  }

  // Try to extract skills
  if (data.skills) {
    normalized.skills = data.skills;
  } else if (data.technicalSkills || data.softSkills) {
    normalized.skills = {
      technical: data.technicalSkills,
      soft: data.softSkills,
      languages: data.languages
    };
  }

  // Transform the normalized data into the template format
  return transformResumeData(normalized as unknown as ParsedResumeData);
}

// Helper function to format dates
function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  if (typeof date === 'string') return date;
  return date.toISOString().split('T')[0];
} 