import SpecialProduct from '../models/specialProduct.model.js';
import { uploadToCloudinary } from '../utils/upload.js';
import fs from 'fs';

// Get all special products
export const getSpecialProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, isActive, isFeatured, search } = req.query;
    
    const query = {};
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Filter by featured
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }
    
    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { firstPrize: { $regex: search, $options: 'i' } },
        { secondPrize: { $regex: search, $options: 'i' } }
      ];
    }
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    const specialProducts = await SpecialProduct.find(query)
      .populate('createdBy', 'name email')
      .populate('participants.user', 'name email')
      .populate('winner.first.user', 'name email')
      .populate('winner.second.user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean({ virtuals: true });
    
    const total = await SpecialProduct.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: specialProducts.length,
      pagination: {
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        total
      },
      data: specialProducts
    });
  } catch (error) {
    console.error('Error fetching special products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch special products',
      error: error.message
    });
  }
};

// Get single special product
export const getSpecialProduct = async (req, res) => {
  try {
    const specialProduct = await SpecialProduct.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('participants.user', 'name email')
      .populate('winner.first.user', 'name email')
      .populate('winner.second.user', 'name email');
    
    if (!specialProduct) {
      return res.status(404).json({
        success: false,
        message: 'Special product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: specialProduct
    });
  } catch (error) {
    console.error('Error fetching special product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch special product',
      error: error.message
    });
  }
};

// Create special product
export const createSpecialProduct = async (req, res) => {
  try {
    const { title, firstOfferDescription, secondOfferDescription, productDescription, firstPrize, secondPrize, category, discount, isActive, isFeatured } = req.body;
    
    // Validate required fields
    if (!title || !firstOfferDescription || !secondOfferDescription || !firstPrize || !secondPrize || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, firstOfferDescription, secondOfferDescription, firstPrize, secondPrize, category'
      });
    }
    
    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      // Upload images to Cloudinary
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.path));
      images = await Promise.all(uploadPromises);
    }
    
    // Validate minimum 4 images
    if (images.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least 4 images'
      });
    }
    
    const specialProduct = await SpecialProduct.create({
      title,
      firstOfferDescription,
      secondOfferDescription,
      productDescription,
      firstPrize,
      secondPrize,
      category,
      images,
      discount: discount ? parseInt(discount) : 30,
      isActive: isActive === 'true' || isActive === true,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      createdBy: req.user.userId
    });
    
    res.status(201).json({
      success: true,
      message: 'Special product created successfully',
      data: specialProduct
    });
  } catch (error) {
    console.error('Error creating special product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create special product',
      error: error.message
    });
  }
};

// Update special product
export const updateSpecialProduct = async (req, res) => {
  try {
    const { title, firstOfferDescription, secondOfferDescription, productDescription, firstPrize, secondPrize, category, discount, isActive, isFeatured } = req.body;
    
    let specialProduct = await SpecialProduct.findById(req.params.id);
    
    if (!specialProduct) {
      return res.status(404).json({
        success: false,
        message: 'Special product not found'
      });
    }
    
    // Handle new image uploads
    let newImages = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.path));
      newImages = await Promise.all(uploadPromises);
    }
    
    // Handle existing images (preserved from frontend after any removals)
    let existingImages = [];
    if (req.body.existingImages) {
      existingImages = Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages];
    }
    
    // If setting as featured, unfeature all other products
    if (isFeatured === 'true' || isFeatured === true) {
      await SpecialProduct.updateMany(
        { _id: { $ne: req.params.id } },
        { $set: { isFeatured: false } }
      );
    }
    
    // Update fields
    if (title) specialProduct.title = title;
    if (firstOfferDescription) specialProduct.firstOfferDescription = firstOfferDescription;
    if (secondOfferDescription) specialProduct.secondOfferDescription = secondOfferDescription;
    if (productDescription !== undefined) specialProduct.productDescription = productDescription;
    if (firstPrize) specialProduct.firstPrize = firstPrize;
    if (secondPrize) specialProduct.secondPrize = secondPrize;
    if (category) specialProduct.category = category;
    if (discount !== undefined) specialProduct.discount = parseInt(discount);
    if (isActive !== undefined) specialProduct.isActive = isActive === 'true' || isActive === true;
    if (isFeatured !== undefined) specialProduct.isFeatured = isFeatured === 'true' || isFeatured === true;
    
    // Combine existing and new images to get final image set
    specialProduct.images = [...existingImages, ...newImages];
    
    await specialProduct.save();
    
    res.status(200).json({
      success: true,
      message: 'Special product updated successfully',
      data: specialProduct
    });
  } catch (error) {
    console.error('Error updating special product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update special product',
      error: error.message
    });
  }
};

// Delete special product
export const deleteSpecialProduct = async (req, res) => {
  try {
    const specialProduct = await SpecialProduct.findById(req.params.id);
    
    if (!specialProduct) {
      return res.status(404).json({
        success: false,
        message: 'Special product not found'
      });
    }
    
    await specialProduct.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Special product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting special product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete special product',
      error: error.message
    });
  }
};

// Join special product (user participation)
export const joinSpecialProduct = async (req, res) => {
  try {
    const specialProduct = await SpecialProduct.findById(req.params.id);
    
    if (!specialProduct) {
      return res.status(404).json({
        success: false,
        message: 'Special product not found'
      });
    }
    
    // Check if already participated
    const alreadyJoined = specialProduct.participants.some(
      p => p.user.toString() === req.user.userId.toString()
    );
    
    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this special product'
      });
    }
    
    specialProduct.participants.push({
      user: req.user._id,
      joinedAt: new Date()
    });
    
    await specialProduct.save();
    
    res.status(200).json({
      success: true,
      message: 'Successfully joined the special product',
      data: specialProduct
    });
  } catch (error) {
    console.error('Error joining special product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join special product',
      error: error.message
    });
  }
};

// Select winners
export const selectWinners = async (req, res) => {
  try {
    const { firstWinnerId, secondWinnerId } = req.body;
    
    const specialProduct = await SpecialProduct.findById(req.params.id);
    
    if (!specialProduct) {
      return res.status(404).json({
        success: false,
        message: 'Special product not found'
      });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can select winners'
      });
    }
    
    // Update winners
    if (firstWinnerId) {
      specialProduct.winner.first = {
        user: firstWinnerId,
        selectedAt: new Date()
      };
    }
    
    if (secondWinnerId) {
      specialProduct.winner.second = {
        user: secondWinnerId,
        selectedAt: new Date()
      };
    }
    
    await specialProduct.save();
    
    res.status(200).json({
      success: true,
      message: 'Winners selected successfully',
      data: specialProduct
    });
  } catch (error) {
    console.error('Error selecting winners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to select winners',
      error: error.message
    });
  }
};

// Upload banner image
export const uploadBanner = async (req, res) => {
  try {
    console.log('=== Upload Banner Called ===');
    console.log('User role:', req.user?.role);
    console.log('Req.file exists:', !!req.file);
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      console.error('❌ Not admin:', req.user.role);
      return res.status(403).json({
        success: false,
        message: 'Only admin can upload banner'
      });
    }

    if (!req.file) {
      console.error('❌ No file received in request');
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file (JPEG, PNG, or WebP)'
      });
    }

    console.log('✅ Banner file received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });
    
    // Check if file exists
    if (!fs.existsSync(req.file.path)) {
      console.error('❌ File does not exist at path:', req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Uploaded file not found on server'
      });
    }
    
    console.log('✅ File exists on disk, size:', fs.statSync(req.file.path).size);
    
    // Upload to Cloudinary
    console.log('📤 Calling uploadToCloudinary...');
    let bannerUrl;
    try {
      bannerUrl = await uploadToCloudinary(req.file.path);
    } catch (cloudinaryError) {
      console.error('❌ Cloudinary upload failed:', cloudinaryError.message);
      return res.status(500).json({
        success: false,
        message: 'Cloudinary upload failed: ' + cloudinaryError.message,
        error: cloudinaryError.message
      });
    }
    
    // Save banner to database
    console.log('💾 Saving banner to database...');
    try {
      // Delete old banner if exists
      await SpecialProduct.deleteMany({ isBanner: true });
      
      // Create new banner document
      const bannerProduct = await SpecialProduct.create({
        title: 'Special Offers Banner',
        firstOfferDescription: 'Banner for special offers page',
        secondOfferDescription: 'Banner image',
        productDescription: 'Banner image for gift products page',
        firstPrize: '0',
        secondPrize: '0',
        category: 'Special Offers',
        images: [bannerUrl],
        isBanner: true,
        isActive: true,
        isFeatured: false,
        createdBy: req.user.userId
      });
      
      console.log('✅ Banner saved to database:', bannerProduct._id);
    } catch (dbError) {
      console.error('❌ Database save failed:', dbError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to save banner to database: ' + dbError.message,
        error: dbError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Banner uploaded successfully to Cloudinary and saved to database',
      data: { bannerUrl }
    });
  } catch (error) {
    console.error('❌ Unexpected error in uploadBanner:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload banner: ' + error.message,
      error: error.message
    });
  }
};

// Get banner image from database
export const getBanner = async (req, res) => {
  try {
    console.log('Get banner from database...');
    
    // Find banner document
    const bannerDoc = await SpecialProduct.findOne({ isBanner: true, isActive: true });
    
    if (!bannerDoc || !bannerDoc.images || bannerDoc.images.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No banner found'
      });
    }

    const bannerUrl = bannerDoc.images[0];
    console.log('✅ Banner found in database:', bannerUrl);

    res.status(200).json({
      success: true,
      data: { bannerUrl }
    });
  } catch (error) {
    console.error('Error fetching banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banner',
      error: error.message
    });
  }
};
