import mongoose, { Document, Schema } from 'mongoose';

export interface IGitHubProject extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  projects: Array<{
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
  }>;
  lastAnalyzed: Date;
}

const projectSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  projects: [{
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
  lastAnalyzed: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for userId and username
projectSchema.index({ userId: 1, username: 1 }, { unique: true });

export const GitHubProject = mongoose.model<IGitHubProject>('GitHubProject', projectSchema); 