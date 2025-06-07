import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ParsedResumeData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationYear: string;
    startYear?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  achievements: Array<{
    title: string;
    type: 'achievement' | 'competition' | 'hackathon';
    date: string;
    description: string;
    position?: string;
    organization?: string;
    url?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    duration?: string;
    url?: string;
  }>;
  skills: string[];
  parsedAt?: Date;
}

export interface GitHubProfile {
  username: string;
  url: string;
  connectedAt: Date;
}

export interface LinkedInData {
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

export interface GitHubProject {
  name: string;
  description: string;
  url: string;
  technologies: string[];
  atsPoints: string[];
  developmentDuration?: string;
  stars: number;
  language: string;
  analysis: string;
  lastUpdated: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  subscription?: {
    plan: 'free' | 'pro' | 'teams';
    status: 'active' | 'cancelled' | 'expired';
    startDate?: Date;
    endDate?: Date;
  };
  resumeUrl?: string;
  resumeUploadedAt?: Date;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  githubProfile?: GitHubProfile;
  githubProjects?: GitHubProject[];
  githubConnected: boolean;
  githubLastUpdated?: Date;
  parsedResume?: ParsedResumeData;
  linkedInProfile?: string;
  linkedInData?: LinkedInData;
  linkedInConnected: boolean;
  linkedInLastUpdated?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'pro', 'teams'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'cancelled', 'expired'],
        default: 'active',
      },
      startDate: Date,
      endDate: Date,
    },
    resumeUrl: {
      type: String,
    },
    resumeUploadedAt: {
      type: Date,
    },
    skills: {
      type: [String],
      default: [],
    },
    githubProfile: {
      username: String,
      url: String,
      connectedAt: Date,
    },
    githubProjects: [{
      name: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      technologies: [{
        type: String,
        required: true
      }],
      atsPoints: [{
        type: String,
        required: true
      }],
      developmentDuration: {
        type: String
      },
      stars: {
        type: Number,
        required: true
      },
      language: {
        type: String,
        required: true
      },
      analysis: {
        type: String,
        required: true
      },
      lastUpdated: {
        type: Date,
        required: true
      }
    }],
    githubConnected: { type: Boolean, default: false },
    githubLastUpdated: { type: Date },
    parsedResume: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      location: { type: String },
      summary: { type: String },
      experience: [{
        company: { type: String, required: true },
        position: { type: String, required: true },
        duration: { type: String, required: true },
        description: { type: String }
      }],
      education: [{
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        field: { type: String },
        graduationYear: { type: String, required: true },
        startYear: { type: String }
      }],
      certifications: [{
        name: { type: String, required: true },
        issuer: { type: String, required: true },
        date: { type: String },
        url: { type: String }
      }],
      achievements: [{
        title: { type: String, required: true },
        type: { type: String, enum: ['achievement', 'competition', 'hackathon'], required: true },
        date: { type: String },
        description: { type: String, required: true },
        position: { type: String },
        organization: { type: String },
        url: { type: String }
      }],
      projects: [{
        name: { type: String, required: true },
        description: { type: String, required: true },
        technologies: [{ type: String }],
        duration: { type: String },
        url: { type: String }
      }],
      skills: [{ type: String }],
      parsedAt: { type: Date, default: Date.now }
    },
    linkedInProfile: { type: String },
    linkedInData: { type: Schema.Types.Mixed },
    linkedInConnected: { type: Boolean, default: false },
    linkedInLastUpdated: { type: Date }
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema); 