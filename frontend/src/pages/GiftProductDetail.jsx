import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, ShoppingCart, Star, Truck, Shield, 
  RotateCcw, Share2, Minus, Plus, ArrowLeft, Gift, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';
import { renderFormattedDescription } from '../utils/formatDescription.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const GiftProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    rating: 0,
    details: '',
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [activeTab, setActiveTab] = useState('reviews');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchGiftProduct();
    fetchReviews();
  }, [id]);

  const fetchGiftProduct = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/special-products?isActive=true`);
      console.log('API Response:', response.data);
      console.log('Looking for ID:', id);
      
      const products = response.data?.data || [];
      const foundProduct = products.find(p => {
        const productId = String(p._id || p.id || '');
        const searchId = String(id || '');
        return productId === searchId;
      });
      
      console.log('Found product:', foundProduct);
      
      if (foundProduct) {
        const p = foundProduct;
        
        // Parse price from various sources
        const parsePrice = (val) => {
          if (!val) return 0;
          const cleaned = String(val).replace(/[^0-9.]/g, '');
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? 0 : parsed;
        };
        
        // Get price from price field or fallback to firstPrize
        const rawPrice = p.price || parsePrice(p.firstPrize) || 0;
        const rawComparePrice = p.comparePrice || parsePrice(p.firstPrize) || 0;
        
        // Calculate discounted price if discount exists
        const hasDiscount = p.discount > 0 && rawPrice > 0;
        const finalPrice = hasDiscount 
          ? Math.round(rawPrice * (1 - p.discount / 100) * 100) / 100
          : rawPrice;
        
        console.log(`Product ${p.title}: rawPrice=${rawPrice}, comparePrice=${rawComparePrice}, discount=${p.discount}, finalPrice=${finalPrice}`);
        
        setProduct({
          _id: p._id || p.id,
          name: p.title || p.name || 'Special Product',
          images: p.images || [],
          price: finalPrice,
          comparePrice: rawComparePrice,
          description: p.productDescription || p.description || p.firstOfferDescription || p.secondOfferDescription || 'Special offer product',
          category: p.category || 'Special Offers',
          stock: p.stock || 10,
          ratings: p.ratings || { average: 0, count: 0 },
          discount: p.discount || 0,
          firstPrize: p.firstPrize,
          secondPrize: p.secondPrize
        });
      } else {
        console.log('No product found with ID:', id);
        console.log('Available products:', products.map(p => ({ id: p._id || p.id, name: p.title || p.name })));
        toast.error('Product not found');
        setProduct(null);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to load product');
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      console.log('Fetching reviews for product ID:', id);
      const response = await axios.get(`${API_URL}/reviews?product=${id}`);
      console.log('Reviews API response:', response.data);
      setReviews(response.data?.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    const result = await addToCart(product._id, quantity, null, null, 'SpecialProduct');
    if (result.success) {
      toast.success('Added to cart!');
    } else {
      toast.error(result.error || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    
    const alreadyInWishlist = isInWishlist(product._id, 'SpecialProduct');
    
    if (alreadyInWishlist) {
      // Remove from wishlist
      const result = await removeFromWishlist(product._id, 'SpecialProduct');
      if (result.success) {
        toast.success('Removed from wishlist!');
      }
    } else {
      // Add to wishlist
      await addToWishlist(product._id, 'SpecialProduct');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to add a review');
      return;
    }

    if (reviewForm.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/reviews`, {
        product: id,
        productType: 'SpecialProduct',
        name: reviewForm.name,
        rating: reviewForm.rating,
        comment: reviewForm.details,
      });

      if (response.data.success) {
        toast.success('Review submitted successfully!');
        setShowReviewModal(false);
        setReviewForm({ name: '', rating: 0, details: '' });
        fetchReviews();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const discountPercentage = product?.comparePrice > product?.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const nextImage = () => {
    setSelectedImage((prev) =>
      prev + 1 >= (product?.images?.length || 1) ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? (product?.images?.length || 1) - 1 : prev - 1
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Gift className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Product not found
        </h2>
        <button
          onClick={() => navigate('/gift-products')}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Back to Gift Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <button
              onClick={() => navigate('/gift-products')}
              className="flex items-center gap-2 text-primary-600 font-medium hover:underline"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Gift Products
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Images */}
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-[300px] sm:max-w-[400px] mx-auto aspect-square rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-md"
            >
              <img
                src={product.images[selectedImage] || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setLightboxOpen(true)}
                onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
              />
            </motion.div>
            {product.images.length > 1 && (
              <div className="flex gap-3 justify-center flex-wrap max-w-[400px] mx-auto">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-primary-500 ring-2 ring-primary-500/30' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Badge */}
            <div className="flex items-center gap-3">
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Gift className="w-4 h-4" />
                Special Offer
              </span>
              {discountPercentage > 0 && (
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                  -{discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(reviews.length > 0 
                        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
                        : 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                ({reviews.length} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                ${product.price?.toFixed(2)}
              </span>
              {discountPercentage > 0 && (
                <span className="text-xl text-gray-500 line-through">
                  ${product.comparePrice?.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description - Max 2 lines for UI */}
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 overflow-hidden">
              {renderFormattedDescription(product.description)}
            </div>

            {/* Quantity & Actions - Responsive */}
            <div className="flex flex-wrap gap-2 sm:gap-3 pt-3 sm:pt-4">
              {/* Quantity */}
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                <button
                  onClick={() => quantity > 1 && setQuantity(q => q - 1)}
                  className="p-2 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg"
                >
                  <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <span className="w-10 sm:w-12 text-center font-medium text-sm sm:text-base">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="p-2 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 min-w-0 flex items-center justify-center gap-2 px-4 sm:px-8 py-2.5 sm:py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm sm:text-base rounded-lg transition-colors shadow-lg"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="truncate">Add to Cart</span>
              </button>

              {/* Wishlist */}
              <button
                onClick={handleAddToWishlist}
                className={`p-2 sm:p-3 border-2 rounded-lg transition-colors ${
                  isInWishlist(product._id, 'SpecialProduct')
                    ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  isInWishlist(product._id, 'SpecialProduct') ? 'fill-red-500' : ''
                }`} />
              </button>

              {/* Add Review */}
              <button
                onClick={() => setShowReviewModal(true)}
                className="p-2 sm:p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-yellow-500 hover:text-yellow-500 transition-colors"
              >
                <Star className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Share */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied!');
                }}
                className="p-2 sm:p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 transition-colors"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t dark:border-gray-700">
              <div className="text-center">
                <Truck className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Free Shipping</span>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Secure Payment</span>
              </div>
              <div className="text-center">
                <RotateCcw className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">30-Day Returns</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'description'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'specifications'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'reviews'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'description' && (
            <div className="text-gray-700">
              <h3 className="text-base font-semibold mb-3">Product Description</h3>
              <div className="text-sm">
                {renderFormattedDescription(product?.productDescription || product?.description || 'No description available.')}
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="text-gray-700">
              <h3 className="text-base font-semibold mb-1">Product Specifications</h3>
              <ul className="list-disc list-inside space-y-0.5 text-sm">
                <li>Category: {product?.category || 'N/A'}</li>
                <li>First Prize: {product?.firstPrize || 'N/A'}</li>
                <li>Second Prize: {product?.secondPrize || 'N/A'}</li>
                <li>Discount: {product?.discount}%</li>
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <motion.div
                      key={review._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="py-4 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-yellow-600">
                            {(review.name || 'A').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        {/* Review Content */}
                        <div className="flex-1">
                          {/* Name + Stars + Date */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {review.name || 'Anonymous'}
                            </span>
                            {/* Stars */}
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500 ml-auto">
                              {new Date(review.createdAt).toLocaleDateString('en-GB')}
                            </span>
                          </div>
                          
                          {/* Product Name Link */}
                          <div className="mb-2">
                            <Link 
                              to={`/gift-products/${product?._id}`}
                              className="text-yellow-600 hover:underline text-sm font-medium"
                            >
                              {product?.title || product?.name}
                            </Link>
                          </div>
                          
                          {/* Review Text */}
                          <p className="text-gray-700">
                            {review.comment || review.details}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No reviews yet. Be the first to review this product!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Your Review</h3>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleReviewSubmit}>
                {/* Avatar + Name + Rating Row */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-yellow-600">
                      {(reviewForm.name || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Name Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewForm.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Product Info Box */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                  <p className="text-yellow-600 text-sm font-medium mb-1">PRODUCT</p>
                  <h4 className="text-yellow-800 font-semibold text-lg">{product?.title || product?.name}</h4>
                </div>

                {/* Review Details */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Review Details</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewForm.details}
                    onChange={(e) => setReviewForm({ ...reviewForm, details: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Write your review here..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && product?.images && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Navigation Arrow */}
          {product.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110 z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Right Navigation Arrow */}
          {product.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110 z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Main Image */}
          <div
            className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={product.images[selectedImage] || '/placeholder-product.jpg'}
              alt={`${product.name} - ${selectedImage + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
            {selectedImage + 1} / {product.images.length}
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto px-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(index);
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index
                      ? 'border-white'
                      : 'border-transparent hover:border-white/50'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GiftProductDetail;