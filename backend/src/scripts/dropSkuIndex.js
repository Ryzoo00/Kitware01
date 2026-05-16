// Script to drop the unique SKU index from products collection
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropSkuIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get the products collection
    const db = mongoose.connection.db;
    
    // Drop the sku_1 index if it exists
    try {
      await db.collection('products').dropIndex('sku_1');
      console.log('Successfully dropped sku_1 index');
    } catch (err) {
      if (err.code === 27) {
        console.log('Index sku_1 does not exist, no need to drop');
      } else {
        console.error('Error dropping index:', err);
      }
    }
    
    // List all indexes to verify
    const indexes = await db.collection('products').indexes();
    console.log('Current indexes:', indexes.map(i => i.name));
    
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

dropSkuIndex();
