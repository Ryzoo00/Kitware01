import mongoose from 'mongoose';

const siteReviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  details: {
    type: String,
    required: true,
    trim: true
  },
  photo: {
    url: String,
    publicId: String
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const SiteReview = mongoose.model('SiteReview', siteReviewSchema);

export default SiteReview;
