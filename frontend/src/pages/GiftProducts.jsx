import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Sparkles, ArrowRight, ShoppingCart, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Safe Product Card Component
const SafeProductCard = ({ product }) => {
  if (!product || !product._id) return null;
  
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  
  const discount = product.comparePrice > product.price 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  
  const imageUrl = product.images && product.images.length > 0 
    ? `${product.images[0]}?v=${new Date().getTime()}` 
    : '/placeholder-product.jpg';

  console.log('Product Card - Images:', product.images);
  console.log('Product Card - Image URL:', imageUrl);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const result = await addToCart(product._id, 1, null, null, 'SpecialProduct');
    if (result.success) {
      toast.success('Added to cart!');
    } else {
      toast.error(result.error || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const alreadyInWishlist = isInWishlist(product._id, 'SpecialProduct');
    
    if (alreadyInWishlist) {
      const result = await removeFromWishlist(product._id, 'SpecialProduct');
      if (result.success) {
        toast.success('Removed from wishlist!');
      }
    } else {
      await addToWishlist(product._id, 'SpecialProduct');
    }
  };

  return (
    <Link to={`/gift-products/${product._id}`}>
      <div className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img 
            src={imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { 
              console.error('Image failed to load:', imageUrl);
              e.target.onerror = null; 
              e.target.src = '/placeholder-product.jpg'; 
            }}
          />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="absolute bottom-2 right-2 flex gap-1">
            <button 
              onClick={handleAddToWishlist}
              className={`w-7 h-7 bg-white/95 dark:bg-gray-800/95 rounded-lg flex items-center justify-center transition-all shadow-lg z-10 ${
                isInWishlist(product._id, 'SpecialProduct')
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'text-gray-700 dark:text-white hover:bg-red-500 hover:text-white'
              }`}
            >
              <Heart className={`w-3 h-3 ${
                isInWishlist(product._id, 'SpecialProduct') ? 'fill-white' : ''
              }`} />
            </button>
            <button 
              onClick={handleAddToCart}
              className="w-7 h-7 bg-white/95 dark:bg-gray-800/95 rounded-lg flex items-center justify-center text-gray-700 dark:text-white hover:bg-primary-600 hover:text-white transition-all shadow-lg z-10"
            >
              <ShoppingCart className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <p className="text-[10px] text-primary-600 dark:text-primary-400 font-medium mb-1">
            {product.category}
          </p>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 min-h-[36px] text-sm">
            {product.name}
          </h3>
          
          {/* Rating with Reviews Count */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(product.ratings?.average || 0)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.ratings?.count || 0} reviews)
            </span>
          </div>

          {/* Price - Show both original and discounted price */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 line-through">
                ${product.comparePrice?.toFixed(2) || '0.00'}
              </span>
              {discount > 0 && (
                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                  -{discount}%
                </span>
              )}
            </div>
            <span className="text-base font-bold text-primary-600 dark:text-primary-400">
              ${product.price?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const GiftProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bannerUrl, setBannerUrl] = useState(null);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchBanner();
    fetchGiftProductsWithReviews();
    // Scroll to special collection if hash is present
    if (window.location.hash === '#special-collection') {
      setTimeout(() => {
        const element = document.getElementById('special-collection');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500); // Wait for products to load
    }
  }, []);

  const fetchBanner = async () => {
    try {
      console.log('Fetching banner from:', `${API_URL}/special-products/banner`);
      const response = await axios.get(`${API_URL}/special-products/banner`);
      console.log('Banner response:', response.data);
      if (response.data?.success && response.data?.data?.bannerUrl) {
        let url = response.data.data.bannerUrl;
        console.log('Raw banner URL:', url);
        // If URL is relative (starts with /), prepend the API base URL
        if (url.startsWith('/')) {
          const baseUrl = API_URL.replace('/api', '');
          url = `${baseUrl}${url}`;
        }
        console.log('Final banner URL:', url);
        setBannerUrl(url);
      } else {
        console.log('No banner URL in response');
        setBannerUrl(null);
      }
    } catch (err) {
      console.log('No banner found or error fetching banner:', err);
      setBannerUrl(null);
    }
  };

  const fetchGiftProductsWithReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/special-products?isActive=true`);
      const data = response.data?.data || [];
      
      console.log('Special Products API Response:', data);
      
      // Filter out banner products (isBanner=true)
      const filteredData = data.filter(product => !product.isBanner);
      console.log('Filtered products (excluded banners):', filteredData.length);
      
      // Fetch reviews for each product
      const productsWithReviews = await Promise.all(
        filteredData.map(async (product) => {
          try {
            const reviewsResponse = await axios.get(`${API_URL}/reviews?product=${product._id}`);
            const reviews = reviewsResponse.data?.data || [];
            const reviewCount = reviews.length;
            const averageRating = reviewCount > 0
              ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
              : 0;
            
            return { ...product, reviews, reviewCount, averageRating };
          } catch (err) {
            console.error(`Error fetching reviews for ${product._id}:`, err);
            return { ...product, reviews: [], reviewCount: 0, averageRating: 0 };
          }
        })
      );

      // Parse price from various sources
      const parsePrice = (val) => {
        if (!val) return 0;
        const cleaned = String(val).replace(/[^0-9.]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
      };

      // Map products with parsed prices
      const mappedProducts = productsWithReviews.map((product) => {
        // Get price from price field or fallback to firstPrize
        const rawPrice = product.price || parsePrice(product.firstPrize) || 0;
        const rawComparePrice = product.comparePrice || parsePrice(product.firstPrize) || 0;

        // Calculate discounted price if discount exists
        const hasDiscount = product.discount > 0 && rawPrice > 0;
        const discountedPrice = hasDiscount
          ? Math.round(rawPrice * (1 - product.discount / 100) * 100) / 100
          : rawPrice;

        return {
          _id: product._id || product.id,
          name: product.title || product.name || 'Product',
          images: product.images || [],
          price: discountedPrice || 0,
          comparePrice: rawComparePrice || 0,
          category: product.category || 'General',
          stock: product.stock || 10,
          isFeatured: product.isFeatured || false,
          ratings: {
            average: product.averageRating || 0,
            count: product.reviewCount || 0
          },
          discount: { percentage: product.discount || 0 }
        };
      });

      setProducts(mappedProducts);
    } catch (err) {
      console.error('Error:', err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Full-width Banner below navbar */}
      {bannerUrl ? (
        <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 overflow-hidden">
          <img
            src={bannerUrl}
            alt="Special Offers Banner"
            className="w-full h-full object-cover object-center"
            style={{ minHeight: '200px' }}
            onError={(e) => {
              console.error('Banner image failed to load:', bannerUrl);
              e.target.onerror = null;
              e.target.src = '';
            }}
          />
        </div>
      ) : (
        <div className="w-full h-[60px] bg-gradient-to-r from-white via-yellow-50 to-yellow-100 flex items-center justify-center"></div>
      )}

      {/* Kitchen Banner Section */}
      <div className="w-full bg-gradient-to-r from-white via-yellow-50 to-yellow-100 overflow-hidden">
        <div className="w-full">
          <img
            src="/kitchen-banner.png"
            alt="Kitchen Collection Banner"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              console.error('Kitchen banner failed to load');
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Admin Add Banner Button */}
        {isAdmin && (
          <div className="mb-6 flex justify-end">
            <Link
              to="/admin/special-products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Add Special Banner
            </Link>
          </div>
        )}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : products.length > 0 ? (
          <>
            <div id="special-collection" className="flex items-center gap-2 mb-8 scroll-mt-4">
              <Gift className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Special Gift Collection
              </h2>
              <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full text-sm font-medium">
                {products.length} Products
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SafeProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No gift products available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Check back later for special offers
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftProducts;
