import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import SpecialProduct from '../models/specialProduct.model.js';
import { Cart } from '../models/cart.model.js';
import { Coupon } from '../models/coupon.model.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      contactInfo,
      paymentMethod,
      couponCode,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      const error = new Error('No order items');
      error.status = 400;
      throw error;
    }

    // Calculate prices
    let itemsPrice = 0;
    const processedItems = [];

    for (const item of orderItems) {
      // Check product type (default to Product for backward compatibility)
      const productType = item.productType || 'Product';
      let product;
      let isSpecialProduct = false;
      
      if (productType === 'SpecialProduct') {
        product = await SpecialProduct.findById(item.productId);
        isSpecialProduct = true;
      } else {
        product = await Product.findById(item.productId);
      }
      
      if (!product) {
        console.warn(`⚠️ Product not found: ${item.productId} (type: ${productType}) - skipping`);
        continue; // Skip invalid products instead of failing
      }

      // For regular products, check stock
      if (!isSpecialProduct && product.stock < item.quantity) {
        const error = new Error(`Insufficient stock for ${product.name}`);
        error.status = 400;
        throw error;
      }

      // Calculate price
      let price;
      let productName;
      let productImage;
      
      if (isSpecialProduct) {
        // Special products use firstPrize and title
        const firstPrizeValue = parseFloat((product.firstPrize?.match(/\d+/) || [0])[0]);
        price = parseFloat((firstPrizeValue * (1 - (product.discount || 0)/100)).toFixed(2));
        productName = product.title;
        productImage = product.images?.[0] || '';
      } else {
        // Regular products
        price = product.discountedPrice || product.price;
        productName = product.name;
        productImage = product.images?.[0] || '';
      }
      
      itemsPrice += price * item.quantity;

      processedItems.push({
        product: product._id,
        name: productName,
        image: productImage,
        price: price,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      });

      // Update stock (only for regular products)
      if (!isSpecialProduct) {
        product.stock -= item.quantity;
        product.salesCount += item.quantity;
        await product.save();
      }
    }

    // Check if any valid items were found
    if (processedItems.length === 0) {
      const error = new Error('No valid products found in cart. Please add products again.');
      error.status = 400;
      throw error;
    }

    const taxPrice = 0; // No tax
    const shippingPrice = 0; // Free shipping initially, will be added on delivery

    // Apply coupon if provided
    let discountAmount = 0;
    let appliedCoupon = null;
    
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.isValid()) {
        discountAmount = coupon.calculateDiscount(itemsPrice);
        appliedCoupon = coupon._id;
        coupon.usageCount += 1;
        coupon.usedBy.push({ user: req.user.userId });
        await coupon.save();
      }
    }

    const totalPrice = itemsPrice + taxPrice + shippingPrice - discountAmount;

    const order = await Order.create({
      user: req.user.userId,
      orderItems: processedItems,
      shippingAddress,
      contactInfo,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountAmount,
      couponCode: appliedCoupon ? couponCode : undefined,
      coupon: appliedCoupon,
      totalPrice,
      statusHistory: [{ status: 'Pending', note: 'Order placed' }],
    });

    // Clear user's cart after order
    await Cart.findOneAndUpdate(
      { user: req.user.userId },
      { $set: { items: [], coupon: null } }
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .sort('-createdAt')
      .populate('orderItems.product', 'name images');

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product');

    if (!order) {
      const error = new Error('Order not found');
      error.status = 404;
      throw error;
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      const error = new Error('Not authorized');
      error.status = 403;
      throw error;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      const error = new Error('Order not found');
      error.status = 404;
      throw error;
    }

    order.status = status;
    order.statusHistory.push({ status, note, timestamp: new Date() });

    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      // Add shipping cost on delivery (10 USD)
      order.shippingPrice = 10;
      // Recalculate total price with shipping
      order.totalPrice = order.itemsPrice + order.taxPrice + order.shippingPrice - (order.discountAmount || 0);
    }

    if (status === 'Paid') {
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Admin
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      const error = new Error('Order not found');
      error.status = 404;
      throw error;
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name email');

    const total = await Order.countDocuments(filter);

    // Calculate total sales
    const totalSales = await Order.aggregate([
      { $match: { status: { $nin: ['Cancelled', 'Refunded'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    res.json({
      success: true,
      data: orders,
      totalSales: totalSales[0]?.total || 0,
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
