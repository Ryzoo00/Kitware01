import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('MongoDB Connected');

    const adminEmail = 'admin@luxeliving.com';
    const adminPassword = 'admin123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log('Email:', adminEmail);
      console.log('Password: admin123 (or your existing password)');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📧 Admin Credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('\n📝 Login at: http://localhost:3000/login');
    console.log('🔗 Admin Panel: http://localhost:3000/admin');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
