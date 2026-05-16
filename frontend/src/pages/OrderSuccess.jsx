import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Truck, ShoppingBag, ArrowRight, Heart, Sparkles, MapPin, Clock, Receipt, Star, Zap, Gift } from 'lucide-react';
import { useEffect, useState } from 'react';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAnimation, setShowAnimation] = useState(false);
  
  useEffect(() => {
    setShowAnimation(true);
  }, []);
  
  const orderDetails = location.state?.order || {
    orderId: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    total: 0,
    items: [],
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50/30 py-6 sm:py-12 px-3 sm:px-4">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-yellow-100/10 to-orange-100/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Success Card */}
        <div className={`bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] overflow-hidden border border-white/50 transition-all duration-1000 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 p-6 sm:p-10 text-center overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/30 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white/20 rounded-full blur-2xl animate-pulse delay-500" />
            </div>

            {/* Success Icon with Animation */}
            <div className="relative mb-4 sm:mb-6">
              <div className={`w-20 h-20 sm:w-28 sm:h-28 mx-auto bg-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-700 delay-300 ${showAnimation ? 'scale-100' : 'scale-0'}`}>
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 sm:w-14 sm:h-14 text-white" strokeWidth={2.5} />
                </div>
              </div>
              {/* Floating Stars */}
              <Star className={`absolute -top-2 left-1/2 -translate-x-16 w-6 h-6 text-yellow-200 fill-yellow-200 transition-all duration-500 delay-500 ${showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              <Star className={`absolute top-4 right-1/2 translate-x-14 w-5 h-5 text-yellow-200 fill-yellow-200 transition-all duration-500 delay-700 ${showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
              <Sparkles className={`absolute bottom-2 left-1/2 -translate-x-20 w-5 h-5 text-white/70 transition-all duration-500 delay-600 ${showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
            </div>

            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-3 tracking-tight transition-all duration-700 delay-200 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Order Confirmed!
            </h1>
            <p className={`text-white/95 text-base sm:text-lg font-medium transition-all duration-700 delay-300 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Thank you for choosing us
            </p>
          </div>

          <div className="p-4 sm:p-6 lg:p-10">
            {/* Appreciation Message */}
            <div className={`text-center mb-6 sm:mb-10 transition-all duration-700 delay-400 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-50 to-amber-50 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span className="text-gray-700 font-medium text-sm sm:text-base">We appreciate your trust</span>
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              </div>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-lg mx-auto px-2">
                Your order is being prepared with care. We'll notify you once it's on its way to you.
              </p>
            </div>

            {/* Order Summary Card */}
            <div className={`bg-gradient-to-br from-gray-50 to-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-100 shadow-sm transition-all duration-700 delay-500 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <Receipt className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Order Summary</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">Details of your purchase</p>
                </div>
              </div>

              <div className="grid gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-white rounded-2xl border border-gray-100 gap-2 sm:gap-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-500 font-semibold text-sm">ID</span>
                    </div>
                    <span className="text-gray-600 font-medium text-sm sm:text-base">Order Number</span>
                  </div>
                  <span className="font-bold text-gray-900 font-mono text-sm sm:text-lg break-all sm:break-normal ml-[52px] sm:ml-0">{orderDetails.orderId}</span>
                </div>

                <div className="flex justify-between items-center p-3 sm:p-4 bg-white rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-gray-600 font-medium text-sm sm:text-base">Total Amount</span>
                  </div>
                  <span className="font-black text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 whitespace-nowrap">
                    ${orderDetails.total?.toFixed(2) || '0.00'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 sm:p-4 bg-white rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-600 font-medium text-sm sm:text-base">Items Ordered</span>
                  </div>
                  <span className="font-bold text-gray-900 text-base sm:text-lg">{orderDetails.items?.length || 0} items</span>
                </div>
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className={`mb-10 transition-all duration-700 delay-600 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Truck className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delivery Journey</h3>
                  <p className="text-gray-500 text-sm">Track your order progress</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="space-y-6">
                  {/* Step 1 - Completed */}
                  <div className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                        <CheckCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="w-1 h-14 bg-gradient-to-b from-green-300 to-green-100 rounded-full mt-2" />
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 text-lg">Order Confirmed</h4>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">DONE</span>
                      </div>
                      <p className="text-gray-500">We've received and confirmed your order</p>
                    </div>
                  </div>

                  {/* Step 2 - Active */}
                  <div className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 animate-pulse">
                        <Package className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="w-1 h-14 bg-gradient-to-b from-orange-200 to-gray-200 rounded-full mt-2" />
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 text-lg">Preparing Order</h4>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">NOW</span>
                      </div>
                      <p className="text-gray-500">Carefully packing your items with love</p>
                    </div>
                  </div>

                  {/* Step 3 - Pending */}
                  <div className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-2xl flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="font-bold text-gray-900 text-lg mb-1">Out for Delivery</h4>
                      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-xl">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <span className="text-amber-700 font-semibold">Est. {orderDetails.estimatedDelivery}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Offer Badge */}
            <div className={`flex items-center gap-4 bg-gradient-to-r from-violet-50 to-purple-50 p-5 rounded-2xl mb-8 border border-violet-100 transition-all duration-700 delay-700 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">Special Surprise!</p>
                <p className="text-gray-600 text-sm">We've included a free gift with your order</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`space-y-4 transition-all duration-700 delay-800 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <button
                onClick={() => navigate('/orders')}
                className="group w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-orange-200 flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-orange-300 hover:scale-[1.02] transition-all duration-300"
              >
                <Receipt className="w-6 h-6" />
                View Order Details
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/products')}
                  className="group py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 hover:scale-[1.02] transition-all duration-300"
                >
                  <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Shop More
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="group py-4 border-2 border-amber-500 text-amber-600 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-50 hover:scale-[1.02] transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Back Home
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <p className={`text-center text-gray-400 text-sm mt-8 transition-all duration-700 delay-1000 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
          Need help? Contact our support team anytime
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;
