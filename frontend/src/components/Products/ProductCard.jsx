import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [productRating, setProductRating] = useState({ average: 0, count: 0 });
  const { addToCart } = useCartStore();
  const { addToWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchProductRating();
  }, [product._id]);

  const fetchProductRating = async () => {
    try {
      const response = await axios.get(`${API_URL}/reviews?product=${product._id}`);
      if (response.data.success && response.data.data.length > 0) {
        const reviews = response.data.data;
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        setProductRating({
          average: total / reviews.length,
          count: reviews.length
        });
      } else {
        setProductRating({
          average: product.ratings?.average || 0,
          count: product.ratings?.count || 0
        });
      }
    } catch (error) {
      setProductRating({
        average: product.ratings?.average || 0,
        count: product.ratings?.count || 0
      });
    }
  };

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? (product.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev + 1 >= (product.images?.length || 1) ? 0 : prev + 1
    );
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    const result = await addToCart(product._id, 1);
    if (result.success) {
      toast.success('Added to cart!');
    } else {
      toast.error(result.error || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }

    if (isInWishlist(product._id)) {
      return;
    }

    const result = await addToWishlist(product._id);
  };

  const discountPercentage = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : product.discount?.percentage || 0;

  const displayPrice = product.discountedPrice || product.price;
  const originalPrice = product.comparePrice > product.price ? product.comparePrice : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <Link to={`/products/${product._id}`}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={product.images?.[currentImageIndex]
                ? `${product.images[currentImageIndex]}?v=${new Date(product.updatedAt).getTime()}`
                : '/placeholder-product.jpg'}
              alt={product.name}
              className="w-full h-full object-cover absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {/* Image Navigation Arrows - Show on hover when multiple images */}
          {product.images?.length > 1 && isHovered && (
            <>
              <div className="absolute right-2 top-2 flex flex-col gap-1 z-10">
                <button
                  onClick={handlePrevImage}
                  className="p-1 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700 transition-all hover:scale-110"
                >
                  <ChevronLeft className="w-3 h-3 dark:text-white" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="p-1 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700 transition-all hover:scale-110"
                >
                  <ChevronRight className="w-3 h-3 dark:text-white" />
                </button>
              </div>

              {/* Image Indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {product.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      currentImageIndex === index
                        ? 'w-4 bg-white'
                        : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discountPercentage}%
            </div>
          )}

          {/* Featured Badge */}
          {product.isFeatured && (
            <div className="absolute top-2 right-2 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Featured
            </div>
          )}

          {/* Action Buttons - Bottom Right */}
          <div className="absolute bottom-2 right-2 flex gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToWishlist}
              className="w-7 h-7 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-700 dark:text-white hover:bg-red-500 hover:text-white transition-all duration-200 shadow-lg border border-gray-100 dark:border-gray-600"
              title="Add to Wishlist"
            >
              <Heart className="w-3 h-3" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="w-7 h-7 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-700 dark:text-white hover:bg-primary-600 hover:text-white transition-all duration-200 shadow-lg border border-gray-100 dark:border-gray-600"
              title="Add to Cart"
            >
              <ShoppingCart className="w-3 h-3" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Category */}
          <p className="text-[10px] text-primary-600 dark:text-primary-400 font-medium mb-1">
            {product.category}
          </p>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 min-h-[36px] text-sm">
            {product.name}
          </h3>

          {/* Reviews */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(productRating.average || 0)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-500">
              ({productRating.average > 0 ? productRating.average.toFixed(1) : '0.0'} • {productRating.count})
            </span>
          </div>

          {/* Price Section - First Price (Original) then Second Price (Discounted) */}
          <div className="flex flex-col gap-1">
            {(product.price > 0 || product.discountedPrice > 0) ? (
              <>
                {/* Always show original price (comparePrice) with strikethrough if it exists */}
                {product.comparePrice > 0 && (
                  <span className="text-xs text-gray-500 line-through">
                    ${product.comparePrice?.toFixed(2)}
                  </span>
                )}
                <span className="text-base font-bold text-primary-600 dark:text-primary-400">
                  ${displayPrice?.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500">Price not available</span>
            )}
          </div>

          {/* Stock Status */}
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-[10px] text-orange-500 mt-1">
              Only {product.stock} left in stock!
            </p>
          )}
          {product.stock === 0 && (
            <p className="text-[10px] text-red-500 mt-1">
              Out of stock
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
