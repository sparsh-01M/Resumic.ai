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
  parsedResume?: ParsedResumeData;
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
    parsedResume: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
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