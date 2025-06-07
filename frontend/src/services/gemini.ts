import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Maximum number of retries for API calls
const MAX_RETRIES = 2;
// Maximum tokens for the response
const MAX_OUTPUT_TOKENS = 4096;

// Helper function to validate and format JSON
const validateAndFormatJSON = (text: string): string => {
  console.log('Validating JSON string:', text);
  
  // First, try to find the JSON object in the text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON object found in the response');
  }
  
  let jsonStr = jsonMatch[0];
  
  // Ensure all arrays are properly closed
  const arrayStack: string[] = [];
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '[') {
        arrayStack.push('[');
      } else if (char === ']') {
        if (arrayStack.length > 0) {
          arrayStack.pop();
        }
      }
    }
  }
  
  // Close any unclosed arrays
  while (arrayStack.length > 0) {
    jsonStr += ']';
    arrayStack.pop();
  }
  
  // Ensure the object is properly closed
  if (!jsonStr.endsWith('}')) {
    jsonStr += '}';
  }
  
  // Validate the JSON structure
  try {
    const parsed = JSON.parse(jsonStr);
    
    // Ensure all required fields are present
    if (!parsed.name || !parsed.email) {
      throw new Error('Missing required fields: name and email');
    }
    
    // Ensure all arrays are properly initialized
    parsed.experience = parsed.experience || [];
    parsed.education = parsed.education || [];
    parsed.skills = parsed.skills || [];
    parsed.projects = parsed.projects || [];
    parsed.certifications = parsed.certifications || [];
    parsed.achievements = parsed.achievements || [];
    
    // Clean up any null values in arrays
    Object.keys(parsed).forEach(key => {
      if (Array.isArray(parsed[key])) {
        parsed[key] = parsed[key].filter(item => item !== null);
      }
    });
    
    return JSON.stringify(parsed);
  } catch (error) {
    console.error('JSON validation error:', error);
    throw new Error(`Invalid JSON structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

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
    graduationYear: string;  // Will store the end year (e.g., "2025" for "2021-2025" or "2019" for "2019")
    startYear?: string;      // Optional start year for date ranges
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
    position?: string;  // e.g., "1st Place", "Runner Up", "Finalist"
    organization?: string;  // e.g., "Google", "Microsoft", "University Name"
    url?: string;  // Link to competition/achievement details
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    duration?: string;
    url?: string;
  }>;
  skills: string[];
}

export const parseResumeWithGemini = async (file: File): Promise<ParsedResumeData> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt} of ${MAX_RETRIES}...`);
      }

      // Log file information
      console.log('Processing file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString()
      });

      // Convert file to base64
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]); // Remove the data URL prefix
        };
        reader.readAsDataURL(file);
      });

      // Log base64 data info
      console.log('Base64 data:', {
        length: base64Data.length,
        prefix: base64Data.substring(0, 20) + '...'
      });

      // Initialize Gemini model with increased token limit
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash-preview-05-20',
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
        }
      });

      // Prepare the prompt with explicit instructions for complete responses
      const prompt = `You are a resume parser. Your task is to analyze the provided resume and extract information into a JSON object.

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON object, no other text
2. Do not include any explanations, markdown, or code blocks
3. Ensure all arrays and objects are properly formatted
4. Use double quotes for all strings
5. Use null for missing optional fields
6. Do not include trailing commas in arrays or objects
7. Do not include empty elements in arrays
8. Do not use undefined, NaN, or Infinity values
9. IMPORTANT: Ensure the response is complete and properly closed
10. Keep descriptions concise but complete
11. If a description is too long, summarize it while maintaining key information

ARRAY FORMATTING RULES:
1. Start arrays with [ and end with ]
2. Separate array elements with commas
3. No trailing comma after the last element
4. Empty arrays should be []
5. For technologies and skills arrays, each element must be a string
6. Do not include empty strings in arrays
7. Do not include null values in arrays

EDUCATION DATE HANDLING:
1. For graduationYear:
   - If a date range is given (e.g., "2021-2025"), store "2025" as graduationYear and "2021" as startYear
   - If only one year is given (e.g., "2019"), store that year as graduationYear
   - If a month and year are given (e.g., "May 2023"), store just the year as graduationYear
   - If "Expected" or "Anticipated" is mentioned, still store the year
   - Always store years as strings
2. For startYear:
   - Only include if a date range is explicitly given
   - Store as string
   - Example: For "2021-2025", store graduationYear: "2025", startYear: "2021"

REQUIRED JSON STRUCTURE:
{
  "name": "Full name as string",
  "email": "Email address as string",
  "phone": "Phone number as string or null",
  "location": "Location as string or null",
  "summary": "Professional summary as string or null",
  "experience": [
    {
      "company": "Company name as string",
      "position": "Job title as string",
      "duration": "Duration as string",
      "description": "Job description as string or null"
    }
  ],
  "education": [
    {
      "institution": "School/University name as string",
      "degree": "Degree name as string",
      "field": "Field of study as string",
      "graduationYear": "End year as string (e.g., '2025' for '2021-2025' or '2019' for '2019')",
      "startYear": "Start year as string (only if date range is given, e.g., '2021' for '2021-2025')"
    }
  ],
  "certifications": [
    {
      "name": "Certification name as string",
      "issuer": "Issuing organization as string",
      "date": "Date earned as string",
      "url": "Certificate URL as string or null"
    }
  ],
  "achievements": [
    {
      "title": "Achievement/Competition/Hackathon name as string",
      "type": "achievement|competition|hackathon",
      "date": "Date as string",
      "description": "Description of achievement as string",
      "position": "Position/rank as string or null",
      "organization": "Organizing body as string or null",
      "url": "URL to achievement details as string or null"
    }
  ],
  "projects": [
    {
      "name": "Project name as string",
      "description": "Project description as string",
      "technologies": ["Tech 1", "Tech 2", "Tech 3"],
      "duration": "Duration as string or null",
      "url": "Project URL as string or null"
    }
  ],
  "skills": ["Skill 1", "Skill 2", "Skill 3"]
}

Remember: 
1. Return ONLY the JSON object, nothing else
2. Ensure the response is complete and properly closed
3. Keep descriptions concise but complete
4. Extract all certifications from the resume, including professional certifications, online courses, and training programs
5. For certifications, include the full name of the certification, the issuing organization, and the date earned
6. If a certification has a verification URL, include it in the url field
7. Extract all achievements, competitions, and hackathons, including:
   - Academic achievements and awards
   - Coding competitions and hackathons
   - Professional competitions and contests
   - Scholarships and grants
   - Recognition and honors
   - Sports achievements (if relevant to professional development)
8. For achievements:
   - Include the type (achievement/competition/hackathon)
   - Note the position/rank if applicable (e.g., "1st Place", "Runner Up")
   - Include the organizing body or institution
   - Add any relevant URLs for verification
   - Provide a clear description of the achievement

`;

      console.log('Sending request to Gemini API...');
      
      // Generate content with the image
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data
              }
            }
          ]
        }]
      });

      console.log('Received response from Gemini API');
      
      const response = await result.response;
      const text = response.text();

      // Log the raw response for debugging
      console.log('Raw Gemini API Response:', {
        length: text.length,
        isEmpty: text.trim().length === 0,
        firstChars: text.substring(0, 50),
        lastChars: text.substring(text.length - 50)
      });

      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Gemini API');
      }

      try {
        // Validate and format the JSON
        const jsonStr = validateAndFormatJSON(text);
        
        // Attempt to parse the JSON
        const parsedData = JSON.parse(jsonStr) as ParsedResumeData;
        
        // Validate required fields and array types
        if (!parsedData.name || !parsedData.email || 
            !Array.isArray(parsedData.experience) || !Array.isArray(parsedData.education) || 
            !Array.isArray(parsedData.skills) || !Array.isArray(parsedData.projects) ||
            !Array.isArray(parsedData.certifications) || !Array.isArray(parsedData.achievements)) {
          console.error('Invalid JSON structure. Parsed data:', parsedData);
          throw new Error('Invalid JSON structure: Missing required fields');
        }

        // Validate array contents
        parsedData.projects.forEach((project, index) => {
          if (!Array.isArray(project.technologies)) {
            throw new Error(`Invalid project at index ${index}: technologies must be an array`);
          }
          project.technologies.forEach((tech, techIndex) => {
            if (typeof tech !== 'string' || !tech.trim()) {
              throw new Error(`Invalid technology at project ${index}, tech ${techIndex}: must be a non-empty string`);
            }
          });
        });

        parsedData.skills.forEach((skill, index) => {
          if (typeof skill !== 'string' || !skill.trim()) {
            throw new Error(`Invalid skill at index ${index}: must be a non-empty string`);
          }
        });

        // Validate education dates
        parsedData.education.forEach((edu, index) => {
          if (!edu.graduationYear || typeof edu.graduationYear !== 'string') {
            throw new Error(`Invalid graduation year at education index ${index}: must be a string`);
          }
          if (edu.startYear && typeof edu.startYear !== 'string') {
            throw new Error(`Invalid start year at education index ${index}: must be a string`);
          }
          // Validate year format (should be 4 digits)
          const yearRegex = /^\d{4}$/;
          if (!yearRegex.test(edu.graduationYear)) {
            throw new Error(`Invalid graduation year format at education index ${index}: must be a 4-digit year`);
          }
          if (edu.startYear && !yearRegex.test(edu.startYear)) {
            throw new Error(`Invalid start year format at education index ${index}: must be a 4-digit year`);
          }
        });

        return parsedData;
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Attempted to parse JSON string:', text);
        lastError = new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        
        // If this is the last attempt, throw the error
        if (attempt === MAX_RETRIES) {
          throw lastError;
        }
        
        // Otherwise, continue to next retry
        continue;
      }
    } catch (error) {
      console.error('Error parsing resume with Gemini:', error);
      
      // Check for specific API errors that shouldn't be retried
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('Invalid or missing Gemini API key. Please check your environment variables.');
        }
        if (error.message.includes('quota')) {
          throw new Error('Gemini API quota exceeded. Please try again later.');
        }
        if (error.message.includes('timeout')) {
          throw new Error('Request to Gemini API timed out. Please try again.');
        }
        
        lastError = error;
        
        // If this is the last attempt, throw the error
        if (attempt === MAX_RETRIES) {
          throw error;
        }
        
        // Otherwise, continue to next retry
        continue;
      }
      
      throw new Error('Failed to parse resume. Please try again.');
    }
  }
  
  // This should never be reached due to the throws above, but TypeScript needs it
  throw lastError || new Error('Failed to parse resume after all retry attempts');
};
