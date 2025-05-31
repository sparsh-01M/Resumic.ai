import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log Cloudinary configuration (without sensitive data)
console.log('Cloudinary configuration:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set',
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set',
  upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET ? 'Set' : 'Not set'
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'resumic/resumes',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw',
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
  } as any,
});

// Create multer upload instance
export const upload = multer({ storage: storage });

// Upload file to Cloudinary
export const uploadToCloudinary = async (file: Express.Multer.File) => {
  try {
    console.log('Starting Cloudinary upload process...');
    console.log('File object:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: file.size,
      destination: file.destination,
      filename: file.filename,
      path: file.path,
      buffer: file.buffer ? 'Present' : 'Not present'
    });

    // When using CloudinaryStorage, the file is already uploaded
    // and the URL is available in file.path
    if (file.path) {
      console.log('Using existing Cloudinary URL from file.path:', file.path);
      return file.path;
    }

    // Fallback for direct upload if needed
    console.log('Attempting direct upload to Cloudinary...');
    if (!file.buffer) {
      throw new Error('No file buffer available for upload');
    }

    const result = await cloudinary.uploader.upload(file.buffer.toString('base64'), {
      resource_type: 'raw',
      folder: 'resumic/resumes',
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    });
    
    console.log('Cloudinary upload successful:', {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    if (error instanceof Error) {
      console.error('Cloudinary error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw new Error(`Failed to upload file to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 