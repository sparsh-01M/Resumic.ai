import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';
import githubRoutes from './routes/github.js';
import linkedinRoutes from './routes/linkedin.js';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://resumicai.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/linkedin', linkedinRoutes);

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
