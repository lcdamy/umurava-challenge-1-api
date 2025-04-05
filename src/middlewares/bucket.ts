import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import multer from 'multer';

// Load environment variables from .env file
dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

// Validate Cloudinary configuration
if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Error: Missing Cloudinary configuration in environment variables.');
    process.exit(1); // Exit the process if configuration is incomplete
}

// Configure Multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Export the configured Multer instance
export default upload;
