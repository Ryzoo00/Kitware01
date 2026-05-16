import Hero from '../models/hero.model.js';
import { uploadToCloudinary } from '../utils/upload.js';
import fs from 'fs';

// Get all heroes (public route - for frontend carousel)
export const getHeroes = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const query = {};
    
    // Filter by active status (for public display)
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const heroes = await Hero.find(query)
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: heroes.length,
      data: heroes
    });
  } catch (error) {
    console.error('Error fetching heroes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heroes',
      error: error.message
    });
  }
};

// Get single hero
export const getHero = async (req, res) => {
  try {
    const hero = await Hero.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: hero
    });
  } catch (error) {
    console.error('Error fetching hero:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero',
      error: error.message
    });
  }
};

// Create new hero
export const createHero = async (req, res) => {
  try {
    const { order, isActive } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }
    
    // Upload image to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.path);
    
    // Clean up local file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    const hero = await Hero.create({
      imageUrl,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user?._id || null
    });
    
    res.status(201).json({
      success: true,
      message: 'Hero created successfully',
      data: hero
    });
  } catch (error) {
    console.error('Error creating hero:', error);
    
    // Clean up local file if error occurred
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create hero',
      error: error.message
    });
  }
};

// Update hero
export const updateHero = async (req, res) => {
  try {
    const hero = await Hero.findById(req.params.id);
    
    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found'
      });
    }
    
    const { order, isActive } = req.body;
    
    // Update fields
    if (order !== undefined) hero.order = order;
    if (isActive !== undefined) hero.isActive = isActive;
    
    // Upload new image if provided
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.path);
      hero.imageUrl = imageUrl;
      
      // Clean up local file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
    
    await hero.save();
    
    res.status(200).json({
      success: true,
      message: 'Hero updated successfully',
      data: hero
    });
  } catch (error) {
    console.error('Error updating hero:', error);
    
    // Clean up local file if error occurred
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update hero',
      error: error.message
    });
  }
};

// Delete hero
export const deleteHero = async (req, res) => {
  try {
    const hero = await Hero.findById(req.params.id);
    
    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found'
      });
    }
    
    await hero.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Hero deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting hero:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hero',
      error: error.message
    });
  }
};

// Toggle hero active status
export const toggleHeroStatus = async (req, res) => {
  try {
    const hero = await Hero.findById(req.params.id);
    
    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found'
      });
    }
    
    hero.isActive = !hero.isActive;
    await hero.save();
    
    res.status(200).json({
      success: true,
      message: `Hero ${hero.isActive ? 'activated' : 'deactivated'} successfully`,
      data: hero
    });
  } catch (error) {
    console.error('Error toggling hero status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle hero status',
      error: error.message
    });
  }
};
