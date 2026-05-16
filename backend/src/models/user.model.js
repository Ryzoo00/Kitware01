import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  phone: {
    type: String,
    default: '',
  },
  addresses: [{
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Pakistan' },
    isDefault: { type: Boolean, default: false },
  }],
  wishlist: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'wishlist.productType',
    },
    productType: {
      type: String,
      enum: ['Product', 'SpecialProduct'],
      default: 'Product',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isBlocked: {
    type: Boolean,
    default: false,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpiry: {
    type: Date,
    default: null,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpiry: {
    type: Date,
    default: null,
  },
  previousPasswords: [{
    type: String,
    select: false,
  }],
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export const User = mongoose.model('User', userSchema);
