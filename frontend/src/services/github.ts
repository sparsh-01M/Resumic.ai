import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface GitHubProject {
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string;
  analysis: string;
  size: number;
  complexity: number;
  impact: number;
  skills: string[];
  atsPoints: string[];
}

export interface ParsedGitHubProfile {
  username: string;
  topProjects: GitHubProject[];
}

export async function parseGitHubProfile(username: string): Promise<ParsedGitHubProfile> {
  try {
    if (!GITHUB_TOKEN) {
      throw new Error('GitHub token is not configured. Please add VITE_GITHUB_TOKEN to your environment variables.');
    }

    // Fetch user's repositories from GitHub API with authentication
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=6`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('GitHub user not found');
      } else if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded or token is invalid');
      }
      throw new Error('Failed to fetch GitHub repositories');
    }

    const repos = await response.json();

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Process each repository
    const projects = await Promise.all(
      repos.map(async (repo: any) => {
        // Prepare repository data for analysis
        const repoData = {
          name: repo.name,
          description: repo.description || 'No description available',
          language: repo.language || 'Not specified',
          stars: repo.stargazers_count,
          topics: repo.topics || [],
          url: repo.html_url,
        };

        // Create prompt for Gemini
        const prompt = `Analyze this GitHub project and provide a brief technical analysis (2-3 sentences):
        Project: ${repoData.name}
        Description: ${repoData.description}
        Language: ${repoData.language}
        Topics: ${repoData.topics.join(', ')}
        
        Focus on:
        1. Technical complexity
        2. Notable features or technologies
        3. Potential impact or usefulness`;

        // Get analysis from Gemini
        const result = await model.generateContent(prompt);
        const analysis = result.response.text();

        return {
          name: repoData.name,
          description: repoData.description,
          url: repoData.url,
          stars: repoData.stars,
          language: repoData.language,
          analysis: analysis.trim(),
        };
      })
    );

    return {
      username,
      topProjects: projects,
    };
  } catch (error) {
    console.error('Error parsing GitHub profile:', error);
    throw error;
  }
}

// Function to display projects in terminal
export function displayProjects(profile: ParsedGitHubProfile) {
  console.log('\n=== GitHub Profile Analysis ===');
  console.log(`Username: ${profile.username}`);
  console.log('\nTop Projects:');
  console.log('=============');

  profile.topProjects.forEach((project, index) => {
    console.log(`\n${index + 1}. ${project.name}`);
    console.log(`   URL: ${project.url}`);
    console.log(`   Language: ${project.language}`);
    console.log(`   Stars: ${project.stars}`);
    console.log(`   Description: ${project.description}`);
    console.log(`   Analysis: ${project.analysis}`);
    console.log('   ----------');
  });
}

export const analyzeTopProjects = async (username: string): Promise<GitHubProject[]> => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=6`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = await response.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const analyzedProjects = await Promise.all(repos.map(async (repo: any) => {
      // Get repository details including size
      const repoDetails = await fetch(`https://api.github.com/repos/${username}/${repo.name}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }).then(res => res.json());

      const prompt = `Analyze this GitHub project and provide a detailed technical assessment. Return ONLY a JSON object with no markdown formatting or additional text:

Project Details:
- Name: ${repo.name}
- Description: ${repo.description || 'No description available'}
- Language: ${repo.language}
- Stars: ${repo.stargazers_count}
- Size: ${repoDetails.size} KB
- URL: ${repo.html_url}

Required JSON structure (return ONLY this JSON object):
{
  "complexity": <number between 1-10>,
  "impact": <number between 1-10>,
  "skills": ["skill1", "skill2", ...],
  "atsPoints": ["point1", "point2"],
  "analysis": "<brief technical analysis>"
}

Ensure the response is valid JSON with no markdown formatting or additional text.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      
      // Remove any markdown code block formatting if present
      const jsonText = responseText.replace(/```json\n?|\n?```/g, '').trim();
      
      try {
        const analysis = JSON.parse(jsonText);
        
        // Validate the response structure
        if (!analysis.complexity || !analysis.impact || !Array.isArray(analysis.skills) || 
            !Array.isArray(analysis.atsPoints) || !analysis.analysis) {
          throw new Error('Invalid analysis structure');
        }

        return {
          name: repo.name,
          description: repo.description || 'No description available',
          url: repo.html_url,
          stars: repo.stargazers_count,
          language: repo.language,
          size: repoDetails.size,
          complexity: analysis.complexity,
          impact: analysis.impact,
          skills: analysis.skills,
          atsPoints: analysis.atsPoints,
          analysis: analysis.analysis
        };
      } catch (parseError) {
        console.error('Error parsing project analysis:', parseError);
        console.error('Raw response:', responseText);
        throw new Error('Failed to parse project analysis');
      }
    }));

    // Sort projects by a combined score of complexity, impact, and size
    const scoredProjects = analyzedProjects.map(project => ({
      ...project,
      score: (project.complexity * 0.4) + (project.impact * 0.4) + (project.size / 1000 * 0.2)
    }));

    scoredProjects.sort((a, b) => b.score - a.score);
    return scoredProjects.slice(0, 3);
  } catch (error) {
    console.error('Error analyzing projects:', error);
    throw error;
  }
};

export const displayTopProjects = (projects: GitHubProject[]) => {
  console.log('\n=== Top 3 Most Significant Projects ===\n');
  
  projects.forEach((project, index) => {
    console.log(`${index + 1}. ${project.name}`);
    console.log(`   URL: ${project.url}`);
    console.log(`   Size: ${project.size} KB`);
    console.log(`   Language: ${project.language}`);
    console.log(`   Stars: ${project.stars}`);
    console.log('\n   Technical Skills & Technologies:');
    project.skills.forEach(skill => console.log(`   - ${skill}`));
    console.log('\n   ATS-Friendly Achievements:');
    project.atsPoints.forEach(point => console.log(`   • ${point}`));
    console.log('\n   Technical Analysis:');
    console.log(`   ${project.analysis}`);
    console.log('\n   Complexity Score:', project.complexity, '/10');
    console.log('   Impact Score:', project.impact, '/10');
    console.log('   '.padEnd(50, '='));
  });
}; 