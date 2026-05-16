import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary config
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('☁️ Cloudinary Config:');
console.log('  Cloud Name:', cloudName);
console.log('  API Key:', apiKey ? 'SET' : 'MISSING');
console.log('  API Secret:', apiSecret ? '***' + apiSecret.slice(-4) : 'MISSING');

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

const KITCHEN_BANNER_URL = 'https://thumbs.dreamstime.com/b/modern-kitchen-countertop-cooking-tools-banner-background-modern-kitchen-countertop-cooking-tools-arrangement-banner-348201884.jpg';

// Download image from URL
const downloadImage = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(dest);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

// Upload to Cloudinary
const uploadToCloudinary = async (filePath) => {
  try {
    console.log('📤 Uploading kitchen banner to Cloudinary...');
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'ecommerce/banners',
      use_filename: true,
      unique_filename: true,
      public_id: 'kitchen-banner'
    });
    console.log('✅ Upload success!');
    console.log('📎 Cloudinary URL:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error.message);
    throw error;
  }
};

// Save banner URL to database
const saveBannerToDB = async (bannerUrl) => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Define SpecialProduct schema inline for this script
    const SpecialProductSchema = new mongoose.Schema({
      title: String,
      firstOfferDescription: String,
      secondOfferDescription: String,
      productDescription: String,
      firstPrize: String,
      secondPrize: String,
      category: String,
      images: [String],
      isBanner: Boolean,
      isActive: Boolean,
      isFeatured: Boolean,
      createdBy: mongoose.Schema.Types.ObjectId
    }, { timestamps: true });

    const SpecialProduct = mongoose.model('SpecialProduct', SpecialProductSchema);

    // Delete old kitchen banner if exists
    await SpecialProduct.deleteMany({ title: 'Kitchen Banner' });
    console.log('🗑️ Old kitchen banner removed');

    // Create new kitchen banner document
    const bannerDoc = await SpecialProduct.create({
      title: 'Kitchen Banner',
      firstOfferDescription: 'Kitchen collection banner',
      secondOfferDescription: 'Kitchen banner image',
      productDescription: 'Kitchen banner for gift products page',
      firstPrize: '0',
      secondPrize: '0',
      category: 'Kitchen',
      images: [bannerUrl],
      isBanner: true,
      isActive: true,
      isFeatured: false,
      createdBy: new mongoose.Types.ObjectId() // Dummy ID, update as needed
    });

    console.log('✅ Kitchen banner saved to database:', bannerDoc._id);
    console.log('📎 Banner URL:', bannerUrl);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Database error:', error.message);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    if (!cloudName || !apiKey || !apiSecret) {
      console.error('❌ Cloudinary credentials missing!');
      console.error('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env');
      process.exit(1);
    }

    const tempPath = path.join(__dirname, 'temp-kitchen-banner.jpg');

    // Download image
    console.log('⬇️ Downloading kitchen banner...');
    await downloadImage(KITCHEN_BANNER_URL, tempPath);
    console.log('✅ Image downloaded:', tempPath);

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(tempPath);

    // Save to database
    await saveBannerToDB(cloudinaryUrl);

    // Cleanup
    fs.unlinkSync(tempPath);
    console.log('🗑️ Temporary file cleaned up');

    console.log('\n🎉 Kitchen banner successfully uploaded to Cloudinary and saved to database!');
    console.log('🔗 Cloudinary URL:', cloudinaryUrl);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

main();
