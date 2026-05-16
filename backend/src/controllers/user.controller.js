import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { Order } from '../models/order.model.js';
import { Review } from '../models/review.model.js';
import SpecialProduct from '../models/specialProduct.model.js';
import { uploadImage } from '../utils/cloudinary.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, isBlocked } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;
    if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .select('-password');

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
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

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Admin
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('wishlist', 'name price images');

    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Get user's orders
    const orders = await Order.find({ user: req.params.id })
      .sort('-createdAt')
      .limit(10);

    // Get user's reviews
    const reviews = await Review.find({ user: req.params.id })
      .sort('-createdAt')
      .limit(10)
      .populate('product', 'name images');

    res.json({
      success: true,
      data: {
        user,
        orders,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isBlocked, phone } = req.body;
    
    console.log('Update user request:', { userId: req.params.id, body: req.body, adminUser: req.user });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isBlocked, phone },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      console.log('User not found:', req.params.id);
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    console.log('User updated successfully:', user);
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      const error = new Error('Cannot delete admin users');
      error.status = 403;
      throw error;
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload user avatar
// @route   PUT /api/users/avatar
// @access  Private
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('Please upload an image');
      error.status = 400;
      throw error;
    }

    // Upload to Cloudinary
    const result = await uploadImage(req.file.path, 'avatars');

    // Update user with new avatar URL
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { avatar: result.url },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatar: result.url },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('wishlist', 'name price images ratings');

    // Get user's order count
    const orderCount = await Order.countDocuments({ user: req.user.userId });

    // Get total spent
    const totalSpent = await Order.aggregate([
      { $match: { user: user._id, status: { $nin: ['Cancelled', 'Refunded'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    res.json({
      success: true,
      data: {
        user,
        stats: {
          orderCount,
          totalSpent: totalSpent[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile/me
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
export const addAddress = async (req, res, next) => {
  try {
    const address = req.body;

    const user = await User.findById(req.user.userId);
    
    // If this is the first address or marked as default, update others
    if (address.isDefault || user.addresses.length === 0) {
      user.addresses.forEach(addr => addr.isDefault = false);
      address.isDefault = true;
    }

    user.addresses.push(address);
    await user.save();

    res.json({
      success: true,
      message: 'Address added successfully',
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
export const updateAddress = async (req, res, next) => {
  try {
    const { street, city, state, zipCode, country, isDefault } = req.body;

    const user = await User.findById(req.user.userId);
    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      const error = new Error('Address not found');
      error.status = 404;
      throw error;
    }

    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;
    address.country = country || address.country;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    
    user.addresses.pull(req.params.addressId);
    
    // If no default address exists, make the first one default
    if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully',
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle wishlist item
// @route   POST /api/users/wishlist
// @access  Private
export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId, productType = 'Product' } = req.body;
    console.log('Toggle wishlist:', { productId, productType, userId: req.user.userId });

    const user = await User.findById(req.user.userId);
    console.log('User wishlist before:', user.wishlist);
    
    // Find index - handle both old format (just ID) and new format (object with product field)
    const index = user.wishlist.findIndex(item => {
      // Handle old format (mongoose ObjectId)
      if (item instanceof mongoose.Types.ObjectId || typeof item === 'string') {
        return item.toString() === productId;
      }
      // Handle new format (object with product field)
      return item.product?.toString() === productId && (item.productType || 'Product') === productType;
    });
    
    let message;

    if (index === -1) {
      // Add to wishlist with new format
      user.wishlist.push({ product: productId, productType });
      message = 'Added to wishlist';
    } else {
      // Remove from wishlist
      user.wishlist.splice(index, 1);
      message = 'Removed from wishlist';
    }

    await user.save();
    console.log('User wishlist after:', user.wishlist);
    
    // Return populated wishlist using getWishlist logic
    const populatedWishlist = await Promise.all(
      user.wishlist.map(async (item) => {
        // Handle old format - convert to new format for response
        if (item instanceof mongoose.Types.ObjectId || typeof item === 'string') {
          const product = await mongoose.model('Product').findById(item).select('name price images ratings isActive');
          if (!product) return null;
          return {
            _id: new mongoose.Types.ObjectId(),
            product: product,
            productType: 'Product',
            addedAt: new Date(),
          };
        }
        
        // Handle new format
        const model = item.productType === 'SpecialProduct' 
          ? mongoose.model('SpecialProduct') 
          : mongoose.model('Product');
        
        const product = await model.findById(item.product).select('name title price images ratings isActive discount firstPrize');
        
        if (!product) return null;
        
        const productData = item.productType === 'SpecialProduct' 
          ? {
              _id: product._id,
              name: product.title,
              price: product.price || parseFloat(((product.firstPrize?.match(/\d+/) || [0])[0] * (1 - product.discount/100)).toFixed(2)) || 0,
              images: product.images,
              ratings: { average: 0, count: 0 },
              isActive: true,
            }
          : product;
        
        return {
          _id: item._id,
          product: productData,
          productType: item.productType || 'Product',
          addedAt: item.addedAt || new Date(),
        };
      })
    );

    const validWishlist = populatedWishlist.filter(item => item !== null);

    res.json({
      success: true,
      message,
      data: validWishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wishlist
// @route   GET /api/users/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user.wishlist || user.wishlist.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }
    
    // Populate wishlist items - handle both old format (just ID) and new format
    const populatedWishlist = await Promise.all(
      user.wishlist.map(async (item) => {
        // Handle old format (mongoose ObjectId) - treat as regular Product
        if (item instanceof mongoose.Types.ObjectId || typeof item === 'string') {
          const product = await mongoose.model('Product').findById(item).select('name price images ratings isActive');
          if (!product) return null;
          return {
            _id: new mongoose.Types.ObjectId(),
            product: product,
            productType: 'Product',
            addedAt: new Date(),
          };
        }
        
        // Handle new format (object with product field)
        const model = item.productType === 'SpecialProduct' 
          ? mongoose.model('SpecialProduct') 
          : mongoose.model('Product');
        
        const product = await model.findById(item.product).select('name title price images ratings isActive discount firstPrize');
        
        if (!product) return null;
        
        // Transform special product data to match regular product format
        const productData = item.productType === 'SpecialProduct' 
          ? {
              _id: product._id,
              name: product.title,
              price: product.price || parseFloat(((product.firstPrize?.match(/\d+/) || [0])[0] * (1 - product.discount/100)).toFixed(2)) || 0,
              images: product.images,
              ratings: { average: 0, count: 0 },
              isActive: true,
            }
          : product;
        
        return {
          _id: item._id || new mongoose.Types.ObjectId(),
          product: productData,
          productType: item.productType || 'Product',
          addedAt: item.addedAt || new Date(),
        };
      })
    );

    // Filter out null values (products that no longer exist)
    const validWishlist = populatedWishlist.filter(item => item !== null);

    res.json({
      success: true,
      data: validWishlist,
    });
  } catch (error) {
    next(error);
  }
};
