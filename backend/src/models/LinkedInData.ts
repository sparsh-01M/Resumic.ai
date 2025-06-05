import mongoose, { Document, Schema } from 'mongoose';

export interface ILinkedInData extends Document {
  userId: mongoose.Types.ObjectId;
  profileUrl: string;
  data: {
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
  };
  lastUpdated: Date;
}

const linkedInDataSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  profileUrl: {
    type: String,
    required: true
  },
  data: {
    name: {
      type: String,
      required: true
    },
    headline: {
      type: String,
      required: true
    },
    summary: {
      type: String,
      required: true
    },
    experience: [{
      title: {
        type: String,
        required: true
      },
      company: {
        type: String,
        required: true
      },
      duration: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      }
    }],
    education: [{
      school: {
        type: String,
        required: true
      },
      degree: {
        type: String,
        required: true
      },
      field: {
        type: String,
        required: true
      },
      duration: {
        type: String,
        required: true
      }
    }],
    skills: [{
      type: String,
      required: true
    }],
    languages: [{
      type: String,
      required: true
    }]
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

export const LinkedInData = mongoose.model<ILinkedInData>('LinkedInData', linkedInDataSchema); 