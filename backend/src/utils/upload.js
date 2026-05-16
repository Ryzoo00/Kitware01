import { uploadImage } from './cloudinary.js';
import fs from 'fs';

export const uploadToCloudinary = async (filePath) => {
  try {
    console.log('📤 Uploading to Cloudinary:', filePath);
    const result = await uploadImage(filePath, 'special-products');
    console.log('✅ Cloudinary upload success:', result.url);
    // Clean up the temporary file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return result.url;
  } catch (error) {
    console.error('❌ Upload to Cloudinary failed:', error.message);
    console.error('Error details:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};
