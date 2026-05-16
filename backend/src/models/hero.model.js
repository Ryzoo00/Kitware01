import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for ordering
heroSchema.index({ order: 1, isActive: -1 });

export default mongoose.model('Hero', heroSchema);
