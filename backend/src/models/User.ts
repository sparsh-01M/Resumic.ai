import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

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
  linkedInData?: {
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
  };
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
      id: String,
      firstName: String,
      lastName: String,
      email: String,
      profilePicture: String,
      headline: String,
      summary: String,
      experience: [{
        title: String,
        company: String,
        startDate: String,
        endDate: String,
        description: String,
      }],
      education: [{
        school: String,
        degree: String,
        fieldOfStudy: String,
        startDate: String,
        endDate: String,
      }],
      skills: [String],
      certifications: [{
        name: String,
        issuer: String,
        date: String,
      }],
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