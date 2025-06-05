import { v2 as cloudinary } from 'cloudinary';

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_UPLOAD_PRESET
} = process.env;

// Validate required environment variables
const missingVars = [];
if (!CLOUDINARY_CLOUD_NAME) missingVars.push('CLOUDINARY_CLOUD_NAME');
if (!CLOUDINARY_API_KEY) missingVars.push('CLOUDINARY_API_KEY');
if (!CLOUDINARY_API_SECRET) missingVars.push('CLOUDINARY_API_SECRET');
if (!CLOUDINARY_UPLOAD_PRESET) missingVars.push('CLOUDINARY_UPLOAD_PRESET');

if (missingVars.length > 0) {
  console.error('Missing required Cloudinary environment variables:', missingVars.join(', '));
  console.error('Please set these environment variables in your .env file or deployment environment');
} else {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    upload_preset: CLOUDINARY_UPLOAD_PRESET
  });

  console.log('Cloudinary configuration:', {
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY ? '***' + CLOUDINARY_API_KEY.slice(-4) : 'Not Set',
    api_secret: CLOUDINARY_API_SECRET ? '***' + CLOUDINARY_API_SECRET.slice(-4) : 'Not Set',
    upload_preset: CLOUDINARY_UPLOAD_PRESET
  });
}

export default cloudinary; 