import { Product } from '../models/product.model.js';
import { Review } from '../models/review.model.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      category,
      minPrice,
      maxPrice,
      search,
      featured,
      trending,
      isActive = true,
    } = req.query;

    // Build filter
    const filter = { isActive };
    
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    if (trending === 'true') filter.isTrending = true;
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('reviews', 'rating');

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    console.log(`🔍 Fetching product with ID: ${productId}`);
    
    const product = await Product.findById(productId)
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name avatar',
        },
      });

    if (!product) {
      console.log(`❌ Product not found in database: ${productId}`);
      const error = new Error('Product not found');
      error.status = 404;
      throw error;
    }

    console.log(`✅ Product found: ${product.name}`);
    
    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Admin
export const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;
    
    // Handle image uploads if files are provided
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadImage(file.path));
      const uploadedImages = await Promise.all(uploadPromises);
      productData.images = uploadedImages.map(img => img.url);
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
export const updateProduct = async (req, res, next) => {
  try {
    const productData = req.body;
    
    // Handle image uploads if files are provided
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadImage(file.path));
      const uploadedImages = await Promise.all(uploadPromises);
      productData.images = uploadedImages.map(img => img.url);
    } else if (req.body.existingImages) {
      // Preserve existing images if no new files uploaded
      const existingImages = Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages];
      productData.images = existingImages;
    }
    // Remove existingImages from productData as it's not a schema field
    delete productData.existingImages;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );

    if (!product) {
      const error = new Error('Product not found');
      error.status = 404;
      throw error;
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      const error = new Error('Product not found');
      error.status = 404;
      throw error;
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      // Note: In production, you'd store public IDs to delete properly
      // For now, we'll just delete the product
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .limit(8)
      .sort('-createdAt');

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle trending status
// @route   PUT /api/products/:id/trending
// @access  Admin
export const toggleTrending = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      const error = new Error('Product not found');
      error.status = 404;
      throw error;
    }

    product.isTrending = !product.isTrending;
    await product.save();

    res.json({
      success: true,
      message: `Product ${product.isTrending ? 'marked as' : 'removed from'} trending`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending products
// @route   GET /api/products/trending
// @access  Public
export const getTrendingProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isTrending: true, isActive: true })
      .limit(6)
      .sort('-salesCount');

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
