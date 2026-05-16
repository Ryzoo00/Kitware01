import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
import { User } from '../models/user.model.js';
import { connectDB } from '../db/connection.js';

const updateAdminUser = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected');

    const oldAdminEmail = 'admin@luxeliving.com';
    const newAdminEmail = 'ryzoo19991@gmail.com';
    const newAdminPassword = 'Ris/\\Amin9991';

    // Delete old admin if exists
    const oldAdmin = await User.findOne({ email: oldAdminEmail });
    if (oldAdmin) {
      await User.deleteOne({ email: oldAdminEmail });
      console.log('❌ Old admin deleted:', oldAdminEmail);
    }

    // Check if new admin already exists
    const existingAdmin = await User.findOne({ email: newAdminEmail });
    if (existingAdmin) {
      // Update password for existing admin - set directly, pre-save hook will hash
      existingAdmin.password = newAdminPassword;
      existingAdmin.role = 'admin';
      existingAdmin.emailVerified = true;
      await existingAdmin.save();
      
      console.log('✅ Admin password updated successfully!');
      console.log('Email:', newAdminEmail);
      console.log('Password:', newAdminPassword);
    } else {
      // Create new admin user - password will be hashed by pre-save hook
      const adminUser = await User.create({
        name: 'Admin User',
        email: newAdminEmail,
        password: newAdminPassword,
        role: 'admin',
        emailVerified: true,
        isActive: true,
      });

      console.log('\n✅ New admin user created successfully!');
      console.log('\n📧 Admin Credentials:');
      console.log('Email:', newAdminEmail);
      console.log('Password:', newAdminPassword);
      console.log('Role:', adminUser.role);
    }

    console.log('\n📝 Login at: http://localhost:3000/login');
    console.log('🔗 Admin Panel: http://localhost:3000/admin');

    process.exit(0);
  } catch (error) {
    console.error('Error updating admin user:', error);
    process.exit(1);
  }
};

updateAdminUser();
