import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

interface GitHubProject {
  name: string;
  description: string;
  languages: string[];
  level: 'basic' | 'intermediate' | 'advanced';
  atsPoints: string[];
  url: string;
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
  linkedInId?: string;
  linkedInData?: any;
  resumeUrl?: string;
  resumeUploadedAt?: Date;
  linkedinId?: string;
  githubUsername?: string;
  githubProjects?: GitHubProject[];
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
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
    linkedInId: {
      type: String,
      unique: true,
      sparse: true,
    },
    linkedInData: {
      type: mongoose.Schema.Types.Mixed,
    },
    resumeUrl: {
      type: String,
    },
    resumeUploadedAt: {
      type: Date,
    },
    linkedinId: {
      type: String,
      unique: true,
      sparse: true,
    },
    githubUsername: {
      type: String,
      unique: true,
      sparse: true,
    },
    githubProjects: [{
      name: String,
      description: String,
      languages: [String],
      level: {
        type: String,
        enum: ['basic', 'intermediate', 'advanced'],
      },
      atsPoints: [String],
      url: String,
    }],
    skills: {
      type: [String],
      default: [],
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