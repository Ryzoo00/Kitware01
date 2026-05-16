import { Coupon } from '../models/coupon.model.js';

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Admin
export const getCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const coupons = await Coupon.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Coupon.countDocuments(filter);

    res.json({
      success: true,
      data: coupons,
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

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Admin
export const getCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      const error = new Error('Coupon not found');
      error.status = 404;
      throw error;
    }

    res.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Admin
export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create({
      ...req.body,
      code: req.body.code.toUpperCase(),
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Admin
export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body.code ? { ...req.body, code: req.body.code.toUpperCase() } : req.body,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      const error = new Error('Coupon not found');
      error.status = 404;
      throw error;
    }

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Admin
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      const error = new Error('Coupon not found');
      error.status = 404;
      throw error;
    }

    res.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      const error = new Error('Invalid coupon code');
      error.status = 400;
      throw error;
    }

    if (!coupon.isValid()) {
      const error = new Error('Coupon is expired or has reached usage limit');
      error.status = 400;
      throw error;
    }

    if (subtotal < coupon.minPurchase) {
      const error = new Error(`Minimum purchase amount of ${coupon.minPurchase} required`);
      error.status = 400;
      throw error;
    }

    const discount = coupon.calculateDiscount(subtotal);

    res.json({
      success: true,
      data: {
        coupon,
        discount,
        isValid: true,
      },
    });
  } catch (error) {
    next(error);
  }
};
