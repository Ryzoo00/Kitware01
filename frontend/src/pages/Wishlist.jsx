import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const wishlistStore = useWishlistStore();
  
  // Safely destructure with defaults
  const wishlist = wishlistStore?.wishlist ?? [];
  const isLoading = wishlistStore?.isLoading ?? false;
  const fetchWishlist = wishlistStore?.fetchWishlist;
  const removeFromWishlist = wishlistStore?.removeFromWishlist;

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  const handleAddToCart = async (product) => {
    if (!product || !product._id) {
      toast.error('Invalid product');
      return;
    }
    const result = await addToCart(product._id, 1);
    if (result.success) {
      toast.success('Added to cart!');
    } else {
      toast.error(result.error || 'Failed to add to cart');
    }
  };

  const handleRemove = async (item) => {
    if (!item || !removeFromWishlist) {
      toast.error('Cannot remove item');
      return;
    }
    try {
      // Pass both productId and productType for the new structure
      await removeFromWishlist(item.product?._id, item.productType);
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="section-padding py-16">
        <div className="max-w-7xl mx-auto text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please Login
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Login to view and manage your wishlist
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

  if (isLoading) {
    return (
      <div className="section-padding py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            My Wishlist
          </h1>
          <div className="animate-pulse grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="section-padding py-16">
        <div className="max-w-7xl mx-auto text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Your Wishlist is Empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Save items you love to your wishlist and find them here anytime
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Explore Products
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Wishlist ({wishlist.length})
          </h1>
          <Link
            to="/products"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {wishlist.map((item, index) => {
            const product = item?.product || item; // Support both old and new structure
            return (
              <motion.div
                key={item?._id || `wishlist-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
              >
                <Link to={`/products/${product?._id}`}>
                  <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={product?.images?.[0] || '/placeholder-product.jpg'}
                      alt={product?.name || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </Link>

                <button
                  onClick={() => handleRemove(item)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                <div className="p-2">
                  <Link to={`/products/${product?._id}`}>
                    <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-1 hover:text-primary-600 transition-colors">
                      {product?.name || 'Unnamed Product'}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product?.ratings?.average || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      ${(product?.discountedPrice || product?.price || 0).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="p-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                    >
                      <ShoppingCart className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
