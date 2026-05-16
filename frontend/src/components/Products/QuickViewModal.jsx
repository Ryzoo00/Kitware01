import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingCart, Star, Check, Truck, Shield, RotateCcw, Share2, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  if (!product) return null;

  const discountPercentage = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : product.discount?.percentage || 0;

  const displayPrice = product.discountedPrice || product.price;
  const originalPrice = product.comparePrice > product.price ? product.comparePrice : product.price;
  const savings = originalPrice - displayPrice;
  
  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    const result = await addToCart(product._id, quantity);
    if (result.success) {
      toast.success('Added to cart!');
    } else {
      toast.error(result.error || 'Failed to add to cart');
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }

    if (inWishlist) {
      const result = await removeFromWishlist(product._id);
      if (result.success) {
        toast.success('Removed from wishlist');
      }
    } else {
      await addToWishlist(product._id);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  const rating = product.ratings?.average || 0;
  const reviewsCount = product.ratings?.count || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-5xl md:max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 dark:bg-gray-700/90 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-lg"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            <div className="flex flex-col md:flex-row h-full overflow-auto">
              {/* Image Section - Left Side */}
              <div className="md:w-[55%] p-6 bg-gray-50 dark:bg-gray-900/30">
                {/* Main Image */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white dark:bg-gray-800 mb-4">
                  <img
                    src={product.images?.[selectedImage]
                      ? `${product.images[selectedImage]}?v=${new Date(product.updatedAt).getTime()}`
                      : '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Thumbnail Images */}
                {product.images?.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto justify-center">
                    {product.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors bg-white ${
                          selectedImage === index
                            ? 'border-primary-500'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                            ? `${img}?v=${new Date(product.updatedAt).getTime()}`
                            : '/placeholder-product.jpg'
                        <img
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details Section - Right Side */}
              <div className="md:w-[45%] p-6 md:p-8 flex flex-col">
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : i < rating
                            ? 'text-yellow-400 fill-yellow-400 opacity-50'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({reviewsCount} reviews)
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {product.name}
                </h2>

                {/* Price */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${displayPrice?.toFixed(2)}
                  </span>
                  {discountPercentage > 0 && (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        ${originalPrice?.toFixed(2)}
                      </span>
                      <span className="text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                        Save ${savings?.toFixed(2)}
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                  {product.description || 'No description available.'}
                </p>

                {/* Quantity and Add to Cart */}
                <div className="flex items-center gap-4 mb-6">
                  {/* Quantity Selector */}
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={increaseQuantity}
                      disabled={quantity >= product.stock}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 flex items-center justify-center gap-2 px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      inWishlist
                        ? 'bg-red-50 border-red-500 text-red-500'
                        : 'border-gray-300 hover:border-red-500 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + '/products/' + product._id);
                      toast.success('Link copied to clipboard!');
                    }}
                    className="p-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 mb-2 text-sky-500">
                      <Truck className="w-full h-full" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Free Shipping</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 mb-2 text-sky-500">
                      <Shield className="w-full h-full" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Secure Payment</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 mb-2 text-sky-500">
                      <RotateCcw className="w-full h-full" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">30-Day Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
