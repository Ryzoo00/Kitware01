import SiteReview from '../models/siteReview.model.js';
import { uploadImage } from '../utils/cloudinary.js';
import fs from 'fs';

export const createSiteReview = async (req, res) => {
  try {
    const { name, email, rating, details } = req.body;

    let photoData = null;

    // Upload image to Cloudinary if provided
    if (req.file) {
      const uploadResult = await uploadImage(req.file.path, 'site-reviews');
      photoData = {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      };
      // Clean up temp file
      fs.unlinkSync(req.file.path);
    }

    const siteReview = new SiteReview({
      name,
      email,
      rating: Number(rating),
      details,
      photo: photoData
    });

    await siteReview.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! It will be visible after approval.',
      data: siteReview
    });
  } catch (error) {
    console.error('Error creating site review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit review'
    });
  }
};

export const getAllSiteReviews = async (req, res) => {
  try {
    const reviews = await SiteReview.find({ isApproved: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPendingReviews = async (req, res) => {
  try {
    const reviews = await SiteReview.find({ isApproved: false })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await SiteReview.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review approved successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await SiteReview.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
