import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
import { User } from '../models/user.model.js';
import { connectDB } from '../db/connection.js';

const createTestUser = async () => {
  try {
    await connectDB();
    
    const email = 'asadshahi891@gmail.com';
    const password = 'password123';
    const name = 'Test User';
    
    // Delete existing user if exists
    await User.deleteOne({ email });
    console.log('Deleted existing user (if any)');
    
    // Create new user with verified email
    // Note: password will be hashed automatically by User model pre-save hook
    const user = await User.create({
      name,
      email,
      password: password, // Plain password - model will hash it
      emailVerified: true, // Auto-verify
      role: 'user', // Change to 'admin' if you want admin access
    });
    
    console.log('✅ User created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', user.role);
    console.log('Email Verified:', user.emailVerified);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createTestUser();
