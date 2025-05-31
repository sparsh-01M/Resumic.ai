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
const validateAndFormatJSON = (jsonStr: string): string => {
  // Log the raw input for debugging
  console.log('Validating JSON string:', {
    length: jsonStr.length,
    isEmpty: jsonStr.trim().length === 0,
    firstChars: jsonStr.substring(0, 50),
    lastChars: jsonStr.substring(jsonStr.length - 50)
  });

  if (!jsonStr || jsonStr.trim().length === 0) {
    throw new Error('Empty response from Gemini API');
  }

  // First, try to find the JSON object boundaries
  const firstBrace = jsonStr.indexOf('{');
  const lastBrace = jsonStr.lastIndexOf('}');
  
  if (firstBrace === -1) {
    throw new Error('Invalid JSON response: Could not find opening brace');
  }
  
  if (lastBrace === -1) {
    // If we can't find the closing brace, the response might be truncated
    console.warn('JSON response appears to be truncated. Attempting to fix...');
    
    // Count opening and closing braces to see if we can fix it
    const openBraces = (jsonStr.match(/{/g) || []).length;
    const closeBraces = (jsonStr.match(/}/g) || []).length;
    
    if (openBraces > closeBraces) {
      // Add missing closing braces
      const missingBraces = openBraces - closeBraces;
      jsonStr = jsonStr + '}'.repeat(missingBraces);
      console.log('Added missing closing braces:', missingBraces);
    } else {
      throw new Error('Invalid JSON response: Could not find closing brace and unable to fix');
    }
  }
  
  // Extract just the JSON object
  let extracted = jsonStr.slice(firstBrace, lastBrace + 1);
  
  // Remove any markdown code block indicators
  extracted = extracted.replace(/```json\n?|\n?```/g, '');
  
  // Remove any leading/trailing whitespace
  extracted = extracted.trim();
  
  // Remove any trailing commas in arrays and objects
  extracted = extracted.replace(/,(\s*[}\]])/g, '$1');
  
  // Log the JSON structure for debugging
  console.log('JSON Structure Analysis:', {
    totalLength: extracted.length,
    first100Chars: extracted.substring(0, 100),
    last100Chars: extracted.substring(extracted.length - 100),
    hasMarkdown: extracted.includes('```'),
    hasNewlines: extracted.includes('\n'),
    braceCount: {
      open: (extracted.match(/{/g) || []).length,
      close: (extracted.match(/}/g) || []).length
    }
  });
  
  // Find all arrays in the JSON
  const arrayMatches = extracted.match(/\[[^\]]*\]/g);
  if (arrayMatches) {
    console.log('Found arrays:', arrayMatches.map(arr => ({
      length: arr.length,
      content: arr.substring(0, 50) + (arr.length > 50 ? '...' : '')
    })));
  }
  
  // Check for common JSON formatting issues
  const issues = [];
  if (extracted.includes('undefined')) issues.push('Contains "undefined"');
  if (extracted.includes('NaN')) issues.push('Contains "NaN"');
  if (extracted.includes('Infinity')) issues.push('Contains "Infinity"');
  if (extracted.match(/,\s*[}\]](?!\s*[,}])/)) issues.push('Has trailing commas');
  if (extracted.match(/\[\s*,/)) issues.push('Has empty array elements');
  if (extracted.match(/{\s*,/)) issues.push('Has empty object elements');
  
  if (issues.length > 0) {
    console.log('Potential JSON issues:', issues);
  }
  
  return extracted;
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
    graduationYear: string;
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
      "graduationYear": "Year as string"
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
3. Keep descriptions concise but complete`;

      console.log('Sending request to Gemini API...');
      
      // Generate content with the image
      const result = await model.generateContent({
        contents: [{
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
            !Array.isArray(parsedData.skills) || !Array.isArray(parsedData.projects)) {
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
