import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
  ChevronRight,
  Check,
  Shield,
  Package,
  Sparkles,
  Heart,
  Home,
  ClipboardList,
} from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { cart, getSubtotal, fetchCart } = useCartStore();

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  console.log('🔵 Checkout page loaded');
  console.log('Is Authenticated:', isAuthenticated);
  console.log('User:', user);
  console.log('Cart:', cart);
  console.log('Cart items:', cart?.items);

  // Check if user is authenticated
  if (!isAuthenticated) {
    console.log('❌ User not authenticated, redirecting to login');
    navigate('/login', { state: { from: '/checkout' } });
    return null;
  }

  // Check if cart has items
  if (!cart?.items || cart.items.length === 0) {
    console.log('❌ Cart is empty, redirecting to products');
    toast.error('Your cart is empty! Add items before checkout.');
    navigate('/products');
    return null;
  }

  console.log('✅ All checks passed, rendering checkout form');

  // Safe user data extraction
  const userName = user?.name || user?.firstName || 'Customer';
  const userEmail = user?.email || '';
  const userPhone = user?.phone || '';
  
  const [formData, setFormData] = useState({
    // Shipping
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Pakistan',
    // Payment
    paymentMethod: 'Cash on Delivery',
  });

  // Pre-populate form with user data when available
  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(' ') || ['', ''];
      setFormData((prev) => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const subtotal = getSubtotal();
  const discountAmount = cart?.coupon
    ? subtotal * (cart.coupon.discountValue / 100)
    : 0;
  const shipping = 10;
  const tax = 0;
  const total = subtotal - discountAmount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName) {
      toast.error('Please enter your name');
      setStep(1);
      return;
    }
    if (!formData.email || !formData.phone) {
      toast.error('Please enter contact information');
      setStep(1);
      return;
    }
    if (!formData.address || !formData.city || !formData.zipCode) {
      toast.error('Please enter complete address');
      setStep(1);
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      
      // Combine first and last name
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      const orderData = {
        orderItems: cart.items.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          productType: item.productType || 'Product',
        })),
        shippingAddress: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        contactInfo: {
          phone: formData.phone,
          email: formData.email,
        },
        paymentMethod: formData.paymentMethod,
        couponCode: cart?.coupon?.code,
      };

      console.log('🔵 Placing order with data:', orderData);

      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('✅ Order placed successfully:', response.data);
      const placedOrderId = response.data.data?._id || response.data._id;
      setOrderId(placedOrderId);
      toast.success('Order placed successfully!');
      
      // Clear cart
      fetchCart();
      
      // Navigate to success page with order details
      navigate('/order-success', {
        state: {
          order: {
            orderId: placedOrderId,
            total: total,
            items: cart.items,
            estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            }),
          },
        },
      });
    } catch (error) {
      console.error('❌ Order error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error details:', error.response?.data?.errors);
      
      let errorMsg = 'Failed to place order';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMsg = Object.values(error.response.data.errors).join(', ');
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { number: 1, title: 'Shipping', icon: MapPin },
    { number: 2, title: 'Payment', icon: CreditCard },
    { number: 3, title: 'Review', icon: ClipboardList },
  ];

  const paymentMethods = [
    { id: 'Cash on Delivery', name: 'Cash on Delivery', icon: Truck },
    { id: 'Credit Card', name: 'Credit Card', icon: CreditCard },
    { id: 'EasyPaisa', name: 'EasyPaisa', icon: Phone },
    { id: 'JazzCash', name: 'JazzCash', icon: Phone },
  ];

  return (
    <div className="section-padding py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Checkout
        </h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12 gap-2 sm:gap-4">
          {steps.map((s, index) => {
            const Icon = s.icon;
            return (
              <div key={s.number} className="flex items-center gap-2 sm:gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 min-w-[100px] sm:min-w-[120px] rounded-full cursor-pointer transition-all duration-300 ${
                    step >= s.number
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => {
                    if (index < step) {
                      console.log(`🔵 Going back to step ${s.number}`);
                      setStep(s.number);
                    }
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">
                    {s.title}
                  </span>
                  {step > s.number && (
                    <Check className="w-4 h-4 ml-1" />
                  )}
                </motion.div>
                {index < steps.length - 1 && (
                  <div className="mx-4 hidden sm:block">
                    <ChevronRight 
                      className={`w-6 h-6 transition-colors ${
                        step > index + 1 
                          ? 'text-primary-600' 
                          : 'text-gray-300 dark:text-gray-600'
                      }`} 
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm"
            >
              {/* Step 1: Shipping */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Shipping Information
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="John"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="+1 234 567 890"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Street Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="123 Main Street"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="New York"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="NY"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="10001"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      console.log('🔵 Moving to step 2');
                      // Basic validation
                      if (!formData.address || !formData.city || !formData.zipCode) {
                        toast.error('Please fill in all required fields');
                        return;
                      }
                      setStep(2);
                    }}
                    className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  >
                    Continue to Payment →
                  </button>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Payment Method
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      const isComingSoon = method.id === 'EasyPaisa' || method.id === 'JazzCash' || method.id === 'Credit Card';
                      return (
                        <button
                          key={method.id}
                          onClick={() => {
                            if (isComingSoon) {
                              toast.info('Coming Soon!');
                              return;
                            }
                            setFormData((prev) => ({
                              ...prev,
                              paymentMethod: method.id,
                            }));
                          }}
                          className={`flex items-center gap-3 p-4 border-2 rounded-xl transition-all ${
                            formData.paymentMethod === method.id
                              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          } ${isComingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={isComingSoon}
                        >
                          <Icon className="w-6 h-6 text-primary-600" />
                          <span className="font-medium">{method.name}</span>
                          {isComingSoon && (
                            <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">Coming Soon</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        console.log('🔵 Going back to step 1');
                        setStep(1);
                      }}
                      className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      ← Back to Shipping
                    </button>
                    <button
                      onClick={() => {
                        console.log('🔵 Moving to step 3 (Review)');
                        setStep(3);
                      }}
                      className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                    >
                      Review Order →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Review Your Order
                  </h2>

                  {/* Order Items */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 sm:p-4 space-y-3">
                    {cart?.items?.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-start gap-3 py-2"
                      >
                        <img
                          src={item.product.images?.[0]}
                          alt={item.product.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base break-words">
                            {item.product.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-sm sm:text-base whitespace-nowrap ml-2">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Details */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="font-semibold mb-2">Shipping to:</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formData.firstName} {formData.lastName}
                      <br />
                      {formData.address}
                      <br />
                      {formData.city}, {formData.state} {formData.zipCode}
                      <br />
                      {formData.country}
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="font-semibold mb-2">Payment Method:</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formData.paymentMethod}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        console.log('🔵 Going back to step 2');
                        setStep(2);
                      }}
                      className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      ← Back to Payment
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isProcessing}
                      className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          🎉 Place Order
                          <Shield className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>

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

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Shield className="w-4 h-4" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
