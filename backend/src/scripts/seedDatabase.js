import mongoose from 'mongoose';
import { Product } from '../models/product.model.js';
import { config } from '../config/index.js';

const sampleProducts = [
  {
    name: 'Premium Chef\'s Knife Set',
    description: 'High-quality stainless steel chef knives with ergonomic wooden handles. Perfect for professional and home kitchens.',
    price: 89.99,
    comparePrice: 120.00,
    images: ['https://images.unsplash.com/photo-1593618998160-c4d5e673c3aa?w=800&q=80'],
    category: 'Kitchen',
    stock: 50,
    sku: 'KNF-001',
    isActive: true,
    isFeatured: true,
    ratings: { average: 4.8, count: 124 }
  },
  {
    name: 'Elegant Ceramic Dinnerware Set',
    description: 'Beautiful 16-piece ceramic dinnerware set with modern minimalist design. Microwave and dishwasher safe.',
    price: 149.99,
    comparePrice: 199.99,
    images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80'],
    category: 'Dining',
    stock: 30,
    sku: 'DIN-001',
    isActive: true,
    isFeatured: true,
    ratings: { average: 4.6, count: 89 }
  },
  {
    name: 'Smart Storage Container Set',
    description: 'Airtight food storage containers with smart locking lids. BPA-free and stackable design.',
    price: 45.99,
    comparePrice: 69.99,
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80'],
    category: 'Storage',
    stock: 100,
    sku: 'STO-001',
    isActive: true,
    isFeatured: true,
    ratings: { average: 4.5, count: 256 }
  },
  {
    name: 'Modern Table Lamp',
    description: 'Stylish LED table lamp with adjustable brightness and color temperature. Perfect for bedside or desk.',
    price: 79.99,
    comparePrice: 99.99,
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80'],
    category: 'Home Decor',
    stock: 40,
    sku: 'DEC-001',
    isActive: true,
    isFeatured: true,
    ratings: { average: 4.7, count: 67 }
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours. Eco-friendly and durable.',
    price: 29.99,
    comparePrice: 39.99,
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'],
    category: 'Essentials',
    stock: 200,
    sku: 'ESS-001',
    isActive: true,
    isTrending: true,
    ratings: { average: 4.9, count: 412 }
  },
  {
    name: 'Luxury Throw Pillow Set',
    description: 'Soft velvet throw pillows with hidden zipper. Adds elegance and comfort to any living space.',
    price: 59.99,
    comparePrice: 79.99,
    images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80'],
    category: 'Home Decor',
    stock: 75,
    sku: 'DEC-002',
    isActive: true,
    isFeatured: true,
    ratings: { average: 4.4, count: 156 }
  },
  {
    name: 'Professional Blender',
    description: 'High-power blender for smoothies, soups, and more. Multiple speed settings and pulse function.',
    price: 199.99,
    comparePrice: 249.99,
    images: ['https://images.unsplash.com/photo-1570222094114-28a9d8286005?w=800&q=80'],
    category: 'Kitchen',
    stock: 25,
    sku: 'KIT-002',
    isActive: true,
    isTrending: true,
    ratings: { average: 4.6, count: 78 }
  },
  {
    name: 'Bamboo Cutting Board Set',
    description: 'Sustainable bamboo cutting boards in 3 sizes. Natural antibacterial properties and knife-friendly surface.',
    price: 34.99,
    comparePrice: 49.99,
    images: ['https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&q=80'],
    category: 'Kitchen',
    stock: 80,
    sku: 'KIT-003',
    isActive: true,
    isFeatured: true,
    ratings: { average: 4.7, count: 203 }
  }
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    console.log('Inserting sample products...');
    await Product.insertMany(sampleProducts);
    console.log(`✅ Successfully inserted ${sampleProducts.length} products`);

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
