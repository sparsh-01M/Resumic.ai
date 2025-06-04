import { Request, Response } from 'express';
import { Octokit } from '@octokit/rest';
import { User } from '../models/User.js';
import { GitHubProject } from '../models/GitHubProject.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!GITHUB_TOKEN) {
  console.error('GitHub token is not configured. Please add GITHUB_TOKEN to your environment variables.');
}

if (!GEMINI_API_KEY) {
  console.error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function analyzeProject(repo: any, username: string): Promise<any> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Get repository details including creation date and last update
  const repoDetails = await octokit.repos.get({
    owner: username,
    repo: repo.name
  });

  // Calculate development duration
  const createdAt = new Date(repoDetails.data.created_at);
  const updatedAt = new Date(repoDetails.data.updated_at);
  const durationMs = updatedAt.getTime() - createdAt.getTime();
  const durationMonths = Math.round(durationMs / (1000 * 60 * 60 * 24 * 30));
  const developmentDuration = `${durationMonths} month${durationMonths !== 1 ? 's' : ''}`;

  // Get repository languages
  const languages = await octokit.repos.listLanguages({
    owner: username,
    repo: repo.name
  });

  const technologies = Object.keys(languages.data);

  // Create prompt for Gemini to analyze the project and generate ATS points
  const prompt = `Analyze this GitHub project and provide a detailed technical assessment. Return ONLY a JSON object with no markdown formatting or additional text:

Project Details:
- Name: ${repo.name}
- Description: ${repo.description || 'No description available'}
- Languages: ${technologies.join(', ')}
- Stars: ${repo.stargazers_count}
- Duration: ${developmentDuration}
- URL: ${repo.html_url}

Required JSON structure (return ONLY this JSON object):
{
  "analysis": "<brief technical analysis of the project, focusing on complexity and impact>",
  "atsPoints": [
    "<25-word ATS-friendly achievement point 1, highlighting technical skills and impact>",
    "<25-word ATS-friendly achievement point 2, focusing on project outcomes and technologies>"
  ]
}

Ensure the response is valid JSON with no markdown formatting or additional text.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().trim();
  
  // Remove any markdown code block formatting if present
  const jsonText = responseText.replace(/```json\n?|\n?```/g, '').trim();
  
  try {
    const analysis = JSON.parse(jsonText);
    
    // Validate the response structure
    if (!analysis.analysis || !Array.isArray(analysis.atsPoints) || analysis.atsPoints.length !== 2) {
      throw new Error('Invalid analysis structure');
    }

    return {
      name: repo.name,
      description: repo.description || 'No description available',
      url: repo.html_url,
      technologies,
      atsPoints: analysis.atsPoints,
      developmentDuration,
      stars: repo.stargazers_count,
      language: repo.language || 'Not specified',
      analysis: analysis.analysis,
      lastUpdated: new Date(repoDetails.data.updated_at)
    };
  } catch (parseError) {
    console.error('Error parsing project analysis:', parseError);
    console.error('Raw response:', responseText);
    throw new Error('Failed to parse project analysis');
  }
}

export const getGitHubAuthUrl = async (req: Request, res: Response) => {
  try {
    // For now, we're using direct GitHub API access with a token
    // In the future, this could be replaced with OAuth flow
    res.json({
      url: 'https://github.com/settings/tokens',
      message: 'Please create a GitHub Personal Access Token and use it to connect your profile',
    });
  } catch (error) {
    console.error('Error getting GitHub auth URL:', error);
    res.status(500).json({ message: 'Failed to get GitHub auth URL' });
  }
};

export const connectGitHubProfile = async (req: Request, res: Response) => {
  try {
    const { githubUrl } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!githubUrl) {
      return res.status(400).json({
        success: false,
        message: 'GitHub URL is required'
      });
    }

    // Extract username from GitHub URL
    const username = githubUrl.split('/').pop()?.replace('@', '');
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GitHub URL'
      });
    }

    if (!GITHUB_TOKEN) {
      return res.status(500).json({
        success: false,
        message: 'GitHub token is not configured on the server'
      });
    }

    // Verify the GitHub user exists
    try {
      await octokit.users.getByUsername({ username });
    } catch (error: any) {
      console.error('GitHub API error:', error);
      if (error.status === 404) {
        return res.status(404).json({
          success: false,
          message: 'GitHub user not found'
        });
      }
      if (error.status === 403) {
        return res.status(403).json({
          success: false,
          message: 'GitHub API access denied. Please check the server configuration.'
        });
      }
      throw error;
    }

    // Get user's top repositories
    const repos = await octokit.repos.listForUser({
      username,
      sort: 'stars',
      per_page: 6
    });

    // Analyze each repository
    const analyzedProjects = await Promise.all(
      repos.data.map(repo => analyzeProject(repo, username))
    );

    // Update user's GitHub profile in database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.githubProfile = {
      username,
      url: githubUrl,
      connectedAt: new Date(),
    };

    await user.save();

    // Store analyzed projects
    const savedProjects = await GitHubProject.findOneAndUpdate(
      { userId, username },
      {
        userId,
        username,
        projects: analyzedProjects,
        lastAnalyzed: new Date()
      },
      { upsert: true, new: true }
    );

    console.log('\n=== GitHub Projects Saved to MongoDB ===');
    console.log(`User ID: ${userId}`);
    console.log(`Username: ${username}`);
    console.log(`Last Analyzed: ${savedProjects.lastAnalyzed.toLocaleString()}`);
    console.log('\nProjects Summary:');
    savedProjects.projects.forEach((project, index) => {
      console.log(`\n${index + 1}. ${project.name}`);
      console.log(`   URL: ${project.url}`);
      console.log(`   Technologies: ${project.technologies.join(', ')}`);
      console.log(`   Stars: ${project.stars}`);
      console.log(`   Language: ${project.language}`);
      console.log(`   Duration: ${project.developmentDuration}`);
      console.log('   ATS Points:');
      project.atsPoints.forEach(point => console.log(`   • ${point}`));
      console.log('   ----------');
    });
    console.log('\n✅ Successfully saved GitHub projects data to MongoDB');

    res.json({
      success: true,
      message: 'GitHub profile connected and analyzed successfully',
      data: {
        username,
        url: githubUrl,
        projects: analyzedProjects
      }
    });
  } catch (error) {
    console.error('Error connecting GitHub profile:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to connect GitHub profile'
    });
  }
};

export const disconnectGitHubProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Update user's GitHub profile in database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove GitHub profile
    user.githubProfile = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'GitHub profile disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting GitHub profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect GitHub profile'
    });
  }
}; 