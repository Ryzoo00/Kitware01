import { Cart } from '../models/cart.model.js';
import { Product } from '../models/product.model.js';
import SpecialProduct from '../models/specialProduct.model.js';
import { Coupon } from '../models/coupon.model.js';

// Helper function to populate cart items with both Product and SpecialProduct
const populateCartItems = async (cart) => {
  const populatedItems = await Promise.all(
    cart.items.map(async (item) => {
      let product;
      if (item.productType === 'SpecialProduct') {
        product = await SpecialProduct.findById(item.product).select('title images firstPrize discount stock');
        if (product) {
          product = {
            ...product.toObject(),
            name: product.title,
            price: product.firstPrize,
          };
        }
      } else {
        product = await Product.findById(item.product).select('name images price discountedPrice stock');
        if (product) {
          product = product.toObject();
        }
      }
      return {
        ...item.toObject(),
        product,
      };
    })
  );
  return populatedItems;
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId })
      .populate('coupon');

    if (!cart) {
      cart = await Cart.create({
        user: req.user.userId,
        items: [],
      });
    }

    console.log('Cart items before population:', cart.items.map(i => ({ 
      productId: i.product, 
      productType: i.productType,
      price: i.price 
    })));

    // Manually populate products from both collections
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        let product;
        console.log('Processing item:', { productId: item.product, productType: item.productType });
        
        if (item.productType === 'SpecialProduct') {
          console.log('Looking up SpecialProduct:', item.product);
          product = await SpecialProduct.findById(item.product).select('title images firstPrize discount stock');
          console.log('SpecialProduct found:', product ? 'YES' : 'NO');
          if (product) {
            product = {
              ...product.toObject(),
              name: product.title,
              price: product.firstPrize,
            };
          }
        } else {
          console.log('Looking up Product:', item.product);
          product = await Product.findById(item.product).select('name images price discountedPrice stock');
          console.log('Product found:', product ? 'YES' : 'NO');
          if (product) {
            product = product.toObject();
          }
        }
        return {
          ...item.toObject(),
          product,
        };
      })
    );

    console.log('Populated items:', populatedItems.map(i => ({ 
      hasProduct: !!i.product, 
      name: i.product?.name 
    })));

    const cartObj = cart.toObject();
    cartObj.items = populatedItems;

    res.json({
      success: true,
      data: cartObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, color, size, productType = 'Product' } = req.body;

    // Try to find product in either Product or SpecialProduct collection
    let product;
    let isSpecialProduct = false;
    
    if (productType === 'SpecialProduct') {
      product = await SpecialProduct.findById(productId);
      isSpecialProduct = true;
    } else {
      product = await Product.findById(productId);
      if (!product) {
        // Try special product as fallback
        product = await SpecialProduct.findById(productId);
        if (product) isSpecialProduct = true;
      }
    }
    
    if (!product) {
      const error = new Error('Product not found');
      error.status = 404;
      throw error;
    }

    // For regular products, check stock
    if (!isSpecialProduct && product.stock < quantity) {
      const error = new Error('Insufficient stock');
      error.status = 400;
      throw error;
    }

    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [] });
    }

    // Check if item already exists in cart
    const itemIndex = cart.items.findIndex(
      item =>
        item.product.toString() === productId &&
        item.color === color &&
        item.size === size
    );

    // Calculate price - special products use firstPrize with discount
    let price;
    if (isSpecialProduct) {
      const firstPrizeValue = parseFloat((product.firstPrize?.match(/\d+/) || [0])[0]);
      price = parseFloat((firstPrizeValue * (1 - (product.discount || 0)/100)).toFixed(2));
    } else {
      price = product.discountedPrice || product.price;
    }

    if (itemIndex > -1) {
      // Update existing item
      cart.items[itemIndex].quantity += Number(quantity);
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        productType: isSpecialProduct ? 'SpecialProduct' : 'Product',
        quantity: Number(quantity),
        color,
        size,
        price,
      });
    }

    await cart.save();

    // Manually populate the cart items
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        let product;
        if (item.productType === 'SpecialProduct') {
          product = await SpecialProduct.findById(item.product).select('title images firstPrize discount stock');
          if (product) {
            product = {
              ...product.toObject(),
              name: product.title,
              price: product.firstPrize,
            };
          }
        } else {
          product = await Product.findById(item.product).select('name images price discountedPrice stock');
          if (product) {
            product = product.toObject();
          }
        }
        return {
          ...item.toObject(),
          product,
        };
      })
    );

    const cartObj = cart.toObject();
    cartObj.items = populatedItems;

    res.json({
      success: true,
      message: 'Item added to cart',
      data: cartObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      const error = new Error('Cart not found');
      error.status = 404;
      throw error;
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      const error = new Error('Item not found in cart');
      error.status = 404;
      throw error;
    }

    if (quantity <= 0) {
      // Remove item
      cart.items.pull(req.params.itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    // Manually populate the cart items
    const populatedItems = await populateCartItems(cart);
    const cartObj = cart.toObject();
    cartObj.items = populatedItems;

    res.json({
      success: true,
      message: 'Cart updated',
      data: cartObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      const error = new Error('Cart not found');
      error.status = 404;
      throw error;
    }

    cart.items.pull(req.params.itemId);
    await cart.save();

    // Manually populate the cart items
    const populatedItems = await populateCartItems(cart);
    const cartObj = cart.toObject();
    cartObj.items = populatedItems;

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: cartObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.userId },
      { $set: { items: [], coupon: null } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Cart cleared',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
// @access  Private
export const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon || !coupon.isValid()) {
      const error = new Error('Invalid or expired coupon');
      error.status = 400;
      throw error;
    }

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      const error = new Error('Cart not found');
      error.status = 404;
      throw error;
    }

    // Check if user already used this coupon
    const alreadyUsed = coupon.usedBy.some(
      use => use.user.toString() === req.user.userId
    );
    if (alreadyUsed) {
      const error = new Error('You have already used this coupon');
      error.status = 400;
      throw error;
    }

    cart.coupon = coupon._id;
    await cart.save();
    await cart.populate('coupon');

    // Manually populate the cart items
    const populatedItems = await populateCartItems(cart);
    const cartObj = cart.toObject();
    cartObj.items = populatedItems;

    res.json({
      success: true,
      message: 'Coupon applied',
      data: cartObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon
// @access  Private
export const removeCoupon = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.userId },
      { $set: { coupon: null } },
      { new: true }
    );

    // Manually populate the cart items
    const populatedItems = await populateCartItems(cart);
    const cartObj = cart.toObject();
    cartObj.items = populatedItems;

    res.json({
      success: true,
      message: 'Coupon removed',
      data: cartObj,
    });
  } catch (error) {
    next(error);
  }
};
