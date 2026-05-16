import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Use process.env since dotenv is already loaded in server.js
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('☁️ Cloudinary Config from process.env:');
console.log('  Cloud Name:', cloudName);
console.log('  API Key:', apiKey ? 'SET' : 'MISSING');
console.log('  API Secret:', apiSecret ? '***' + apiSecret.slice(-4) : 'MISSING');

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

export const uploadImage = async (filePath, folder = 'products') => {
  try {
    console.log('=== Cloudinary Upload Started ===');
    console.log('File path:', filePath);
    console.log('Folder:', folder);
    console.log('Config check - Cloud Name:', cloudName);
    
    // Check if config is valid
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials not configured. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env');
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    console.log('✅ File exists, starting upload...');
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `ecommerce/${folder}`,
      use_filename: true,
      unique_filename: true,
    });
    
    console.log('✅ Upload success:', result.secure_url);
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error.message);
    console.error('Error details:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log('✅ Deleted:', publicId);
  } catch (error) {
    console.error('❌ Delete error:', error.message);
    throw error;
  }
};

export { cloudinary };
