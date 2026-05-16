import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Eye, Trash2, Heart, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RecentlyViewed = () => {
  const [recentProducts, setRecentProducts] = useState([]);
  const [productRatings, setProductRatings] = useState({});
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { addToWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const loadRecent = () => {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        const products = JSON.parse(stored);
        setRecentProducts(products.slice(0, 6));
        // Fetch actual ratings for each product
        products.forEach(p => fetchProductRating(p._id));
      }
    };
    loadRecent();
    window.addEventListener('recentlyViewedUpdated', loadRecent);
    return () => window.removeEventListener('recentlyViewedUpdated', loadRecent);
  }, []);

  const fetchProductRating = async (productId) => {
    try {
      const response = await axios.get(`${API_URL}/reviews?product=${productId}`);
      if (response.data.success && response.data.data.length > 0) {
        const reviews = response.data.data;
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        const average = total / reviews.length;
        setProductRatings(prev => ({
          ...prev,
          [productId]: { average, count: reviews.length }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch rating:', error);
    }
  };

  const clearRecent = (e) => {
    e.stopPropagation();
    localStorage.removeItem('recentlyViewed');
    setRecentProducts([]);
  };

  if (recentProducts.length === 0) return null;

  return (
    <section className="py-12 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
            >
              <Eye className="w-6 h-6 text-primary-600" />
              Recently Viewed
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 dark:text-gray-400 mt-1"
            >
              Products you&apos;ve looked at recently
            </motion.p>
          </div>
          <button
            onClick={clearRecent}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {recentProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/product/${product._id}`)}
              className="group cursor-pointer bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.images?.[0]
                    ? `${product.images[0]}?v=${new Date(product.updatedAt).getTime()}`
                    : '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.discount?.percentage > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    -{product.discount.percentage}%
                  </div>
                )}
                {/* Action Buttons */}
                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isAuthenticated) {
                        toast.error('Please login to add to wishlist');
                        return;
                      }
                      addToWishlist(product._id);
                    }}
                    className="w-7 h-7 bg-white/95 rounded-lg flex items-center justify-center text-gray-700 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                  >
                    <Heart className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isAuthenticated) {
                        toast.error('Please login to add items to cart');
                        return;
                      }
                      addToCart(product._id, 1).then(result => {
                        if (result.success) toast.success('Added to cart!');
                        else toast.error(result.error || 'Failed to add');
                      });
                    }}
                    className="w-7 h-7 bg-white/95 rounded-lg flex items-center justify-center text-gray-700 hover:bg-primary-600 hover:text-white transition-all shadow-lg"
                  >
                    <ShoppingCart className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">
                  {product.name}
                </h3>
                {(() => {
                  const ratingData = productRatings[product._id] || product.ratings || { average: 0, count: 0 };
                  return (
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.round(ratingData.average || 0)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">
                        {ratingData.average ? ratingData.average.toFixed(1) : '0.0'}
                      </span>
                    </div>
                  );
                })()}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary-600">
                    ${product.discountedPrice || product.price}
                  </span>
                  {product.comparePrice > product.price && (
                    <span className="text-xs text-gray-400 line-through">
                      ${product.comparePrice}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
