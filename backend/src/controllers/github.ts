import { Request, Response } from 'express';
import { Octokit } from '@octokit/rest';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { User } from '../models/User.js';

// Initialize Octokit
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface GitHubProject {
  name: string;
  description: string;
  languages: string[];
  level: 'basic' | 'intermediate' | 'advanced';
  atsPoints: string[];
  url: string;
}

// Use the correct type from Octokit
type GitHubRepo = Octokit.ReposListForUserResponseData[0];

export const parseGitHubProfile = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!username) {
      return res.status(400).json({ error: 'GitHub username is required' });
    }

    // Fetch user's repositories
    const { data: repos } = await octokit.repos.listForUser({
      username,
      sort: 'updated',
      per_page: 100,
    });

    // Filter out forks and empty repos
    const userRepos = repos.filter(repo => !repo.fork && repo.size > 0);

    // Process each repository
    const projects: GitHubProject[] = [];
    const allLanguages = new Set<string>();

    for (const repo of userRepos) {
      // Get repository languages
      const { data: languages } = await octokit.repos.listLanguages({
        owner: username,
        repo: repo.name,
      });

      const languageNames = Object.keys(languages);
      languageNames.forEach(lang => allLanguages.add(lang));

      // Get repository content for analysis
      const { data: readme } = await octokit.repos.getReadme({
        owner: username,
        repo: repo.name,
      });

      const readmeContent = Buffer.from(readme.content, 'base64').toString();

      // Use Gemini to analyze the project
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `
        Analyze this GitHub project and provide:
        1. Project complexity level (basic/intermediate/advanced)
        2. Two ATS-friendly bullet points highlighting key achievements/features
        
        Project details:
        Name: ${repo.name}
        Description: ${repo.description || 'No description provided'}
        Languages: ${languageNames.join(', ')}
        README: ${readmeContent.substring(0, 1000)} // Limit content for API
        
        Format the response as JSON:
        {
          "level": "basic|intermediate|advanced",
          "atsPoints": ["point1", "point2"]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = JSON.parse(response.text());

      projects.push({
        name: repo.name,
        description: repo.description || '',
        languages: languageNames,
        level: analysis.level,
        atsPoints: analysis.atsPoints,
        url: repo.html_url,
      });
    }

    // Update user in database
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          githubUsername: username,
          githubProjects: projects,
          skills: Array.from(allLanguages),
        },
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      projects,
      skills: Array.from(allLanguages),
    });
  } catch (error) {
    console.error('GitHub profile parsing error:', error);
    res.status(500).json({
      error: 'Failed to parse GitHub profile',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}; 