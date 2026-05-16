import { Review } from '../models/review.model.js';
import { Product } from '../models/product.model.js';
import { Order } from '../models/order.model.js';

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
export const getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, product, user, isApproved } = req.query;

    const filter = {};
    if (product) filter.product = product;
    if (user) filter.user = user;
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name avatar')
      .populate('product', 'name images');

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: reviews,
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

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
export const getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('product', 'name images');

    if (!review) {
      const error = new Error('Review not found');
      error.status = 404;
      throw error;
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Public
export const createReview = async (req, res, next) => {
  try {
    const { product, rating, title, comment, detailB, name, email } = req.body;

    // Support both authenticated and guest users
    const userId = req.user?.userId;
    const isGuest = !userId;

    if (!isGuest) {
      // Check if authenticated user already reviewed this product
      const existingReview = await Review.findOne({
        user: userId,
        product,
      });

      if (existingReview) {
        const error = new Error('You have already reviewed this product');
        error.status = 400;
        throw error;
      }
    }

    // Check if user purchased this product (only for authenticated users)
    let hasOrdered = false;
    if (userId) {
      hasOrdered = await Order.findOne({
        user: userId,
        'orderItems.product': product,
        status: { $in: ['Delivered'] },
      });
    }

    const reviewData = {
      product,
      rating,
      title,
      comment,
      detailB,
      name: isGuest ? name : undefined,
      email: isGuest ? email : undefined,
      verifiedPurchase: !!hasOrdered,
    };

    // Only add user if authenticated
    if (userId) {
      reviewData.user = userId;
    }

    const review = await Review.create(reviewData);

    // Populate user data if available
    if (userId) {
      await review.populate('user', 'name avatar');
    }

    // Update product ratings
    await updateProductRatings(product);

    // Add review to product
    await Product.findByIdAndUpdate(product, {
      $push: { reviews: review._id },
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;

    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!review) {
      const error = new Error('Review not found or unauthorized');
      error.status = 404;
      throw error;
    }

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;

    await review.save();
    await review.populate('user', 'name avatar');

    // Update product ratings
    await updateProductRatings(review.product);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteReview = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    
    // If not admin, only allow deleting own reviews
    if (req.user.role !== 'admin') {
      filter.user = req.user.userId;
    }

    const review = await Review.findOneAndDelete(filter);

    if (!review) {
      const error = new Error('Review not found or unauthorized');
      error.status = 404;
      throw error;
    }

    // Update product ratings
    await updateProductRatings(review.product);

    // Remove review from product
    await Product.findByIdAndUpdate(review.product, {
      $pull: { reviews: review._id },
    });

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Moderate review (Admin)
// @route   PUT /api/reviews/:id/moderate
// @access  Admin
export const moderateReview = async (req, res, next) => {
  try {
    const { isApproved } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    ).populate('user', 'name avatar');

    if (!review) {
      const error = new Error('Review not found');
      error.status = 404;
      throw error;
    }

    // Update product ratings
    await updateProductRatings(review.product);

    res.json({
      success: true,
      message: `Review ${isApproved ? 'approved' : 'unapproved'}`,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Public
export const markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      const error = new Error('Review not found');
      error.status = 404;
      throw error;
    }

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update product ratings
const updateProductRatings = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(stats[0].avgRating * 10) / 10,
      'ratings.count': stats[0].totalReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': 0,
      'ratings.count': 0,
    });
  }
};
