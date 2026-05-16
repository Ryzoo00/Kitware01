import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  X,
  Package,
} from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    cart,
    fetchCart,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    getSubtotal,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const result = await updateQuantity(itemId, newQuantity);
    if (!result.success) {
      toast.error(result.error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    const result = await removeFromCart(itemId);
    if (result.success) {
      toast.success('Item removed from cart');
    } else {
      toast.error(result.error);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    setIsApplyingCoupon(true);
    const result = await applyCoupon(couponCode);
    if (result.success) {
      toast.success('Coupon applied successfully!');
      setCouponCode('');
    } else {
      toast.error(result.error || 'Invalid coupon code');
    }
    setIsApplyingCoupon(false);
  };

  const handleRemoveCoupon = async () => {
    const result = await removeCoupon();
    if (result.success) {
      toast.success('Coupon removed');
    }
  };

  const subtotal = getSubtotal();
  const discountAmount = cart?.coupon ? (subtotal * (cart.coupon.discountValue / 100)) : 0;
  const shipping = 10;
  const tax = 0;
  const total = subtotal - discountAmount;

  if (!isAuthenticated) {
    return (
      <div className="section-padding py-16">
        <div className="max-w-7xl mx-auto text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Please login to view your cart
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Login
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="section-padding py-16">
        <div className="max-w-7xl mx-auto text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Shopping Cart ({cart.items.length} items)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item, index) => {
              // Generate a unique key if _id is missing
              const itemKey = item?._id || `cart-item-${index}`;
              
              // Check if we have product data
              const hasProduct = item?.product && (item.product._id || item.product.name || item.product.title);
              const productId = item?.product?._id || item?.product;
              const productName = item?.product?.name || item?.product?.title || 'Unknown Product';
              const productImage = item?.product?.images?.[0] || '/placeholder-product.jpg';
              const isSpecial = item?.productType === 'SpecialProduct';
              
              return (
              <motion.div
                key={itemKey}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex gap-3 sm:gap-4 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Product Image */}
                <Link
                  to={isSpecial && hasProduct
                    ? `/special-products/${productId}` 
                    : hasProduct ? `/products/${productId}` : '#'}
                  className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                >
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={isSpecial && hasProduct
                      ? `/special-products/${productId}` 
                      : hasProduct ? `/products/${productId}` : '#'}
                    className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 transition-colors line-clamp-2"
                  >
                    {productName}
                  </Link>
                  
                  {item.color && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Color: {item.color}
                    </p>
                  )}
                  {item.size && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Size: {item.size}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 gap-2">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 sm:w-10 text-center font-medium text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => item._id && handleRemoveItem(item._id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors self-start"
                  disabled={!item._id}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            )})}

            {/* Continue Shopping */}
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>

              {/* Coupon Code */}
              <div className="mb-6">
                {cart.coupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        {cart.coupon.code}
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon}
                      className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="text-sm italic">after delivred</span>
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  console.log('🔵 Checkout button clicked');
                  console.log('Is Authenticated:', isAuthenticated);
                  console.log('Cart items:', cart?.items);
                  
                  if (!isAuthenticated) {
                    console.log('❌ Not authenticated, redirecting to login');
                    toast.error('Please login to proceed with checkout');
                    navigate('/login', { state: { from: '/checkout' } });
                    return;
                  }
                  
                  if (!cart?.items || cart.items.length === 0) {
                    console.log('❌ Cart is empty');
                    toast.error('Your cart is empty!');
                    return;
                  }
                  
                  console.log('✅ Navigating to checkout...');
                  navigate('/checkout');
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Package className="w-4 h-4" />
                  Secure
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Tag className="w-4 h-4" />
                  Best Price
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
