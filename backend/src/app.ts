import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import linkedinRoutes from './routes/linkedin.js';
import resumeRoutes from './routes/resume.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/linkedin', linkedinRoutes);
app.use('/api/resume', resumeRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

export default app; 
