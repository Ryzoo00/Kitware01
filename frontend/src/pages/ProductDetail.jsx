import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingCart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  X,
  Upload,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';
import { renderFormattedDescription } from '../utils/formatDescription.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromGiftProducts = searchParams.get('from') === 'gift-products';
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState('reviews');
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: '',
    rating: 0,
    details: '',
    detailB: '',
    photo: null,
  });
  const [productReviews, setProductReviews] = useState([]);
  const [hoverRating, setHoverRating] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { addToCart } = useCartStore();
  const { addToWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  // Calculate rating from reviews
  const calculateRating = () => {
    if (productReviews.length === 0) {
      return { average: product?.ratings?.average || 0, count: product?.ratings?.count || 0 };
    }
    const total = productReviews.reduce((sum, r) => sum + r.rating, 0);
    return {
      average: total / productReviews.length,
      count: productReviews.length
    };
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Fetching product with ID:', id);
      const response = await axios.get(`${API_URL}/products/${id}`);
      console.log('✅ Product fetched successfully:', response.data.data.name);
      const productData = response.data.data;
      setProduct(productData);
      if (productData.colors?.length > 0) {
        setSelectedColor(productData.colors[0]);
      }
      if (productData.sizes?.length > 0) {
        setSelectedSize(productData.sizes[0].name);
      }
      // Save to recently viewed
      saveToRecentlyViewed(productData);
    } catch (error) {
      console.error('❌ Failed to fetch product:', error);
      console.error('Error response:', error.response?.data);
      console.error('Product ID:', id);
      toast.error('Product not found or has been removed');
      navigate('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const saveToRecentlyViewed = (productData) => {
    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const filtered = recent.filter(p => p._id !== productData._id);
    const updated = [{
      _id: productData._id,
      name: productData.name,
      images: productData.images,
      price: productData.price,
      discountedPrice: productData.discountedPrice,
      comparePrice: productData.comparePrice,
      discount: productData.discount,
      ratings: productData.ratings,
    }, ...filtered].slice(0, 12);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    window.dispatchEvent(new Event('recentlyViewedUpdated'));
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    const result = await addToCart(
      product._id,
      quantity,
      selectedColor?.name,
      selectedSize
    );

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
    if (isInWishlist(product._id)) {
      toast.success('Already in wishlist!');
      return;
    }
    await addToWishlist(product._id, 'Product');
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

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

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setReviewForm({ ...reviewForm, photo: e.target.files[0] });
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductReviews();
    }
  }, [id]);

  const fetchProductReviews = async () => {
    try {
      console.log('🔍 Fetching reviews for product:', id);
      const response = await axios.get(`${API_URL}/reviews?product=${id}`);
      console.log('✅ Reviews response:', response.data);
      if (response.data.success) {
        console.log('✅ Reviews fetched:', response.data.data.length, 'reviews');
        setProductReviews(response.data.data);
      }
    } catch (error) {
      console.error('❌ Failed to fetch reviews:', error);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const reviewData = {
        name: reviewForm.name,
        email: reviewForm.email,
        rating: reviewForm.rating,
        comment: reviewForm.details,
        detailB: reviewForm.detailB,
        product: id,
      };
      const response = await axios.post(`${API_URL}/reviews`, reviewData);
      if (response.data.success) {
        toast.success('Review submitted successfully!');
        setShowReviewModal(false);
        setReviewForm({ name: '', email: '', rating: 0, details: '', detailB: '', photo: null });
        fetchProductReviews();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (isLoading) {
    return (
      <div className="section-padding py-16">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discountPercentage = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : product.discount?.percentage || 0;

  return (
    <div className="section-padding py-6">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-primary-600">
            Home
          </button>
          <ChevronRight className="w-4 h-4" />
          {fromGiftProducts ? (
            <button onClick={() => navigate('/gift-products')} className="hover:text-primary-600 text-primary-600 font-medium">
              Gift Products
            </button>
          ) : (
            <button onClick={() => navigate('/products')} className="hover:text-primary-600">
              Products
            </button>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image with Carousel */}
            <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
              <motion.div
                className="flex h-full"
                animate={{ x: -selectedImage * 100 + '%' }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                {product.images?.map((image, index) => (
                  <div
                    key={index}
                    className="w-full flex-shrink-0 h-full cursor-zoom-in"
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onMouseMove={handleMouseMove}
                    onClick={() => setLightboxOpen(true)}
                  >
                    <motion.img
                      src={image
                        ? `${image}?v=${new Date(product.updatedAt).getTime()}`
                        : '/placeholder-product.jpg'}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                      style={
                        isZoomed && selectedImage === index
                          ? {
                              transform: 'scale(2)',
                              transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                            }
                          : {}
                      }
                    />
                  </div>
                ))}
              </motion.div>

              {/* Navigation Arrows */}
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all hover:scale-110"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all hover:scale-110"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          selectedImage === index
                            ? 'w-6 bg-white'
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Discount Badge */}
              {discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{discountPercentage}%
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-primary-600'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image
                        ? `${image}?v=${new Date(product.updatedAt).getTime()}`
                        : '/placeholder-product.jpg'}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <p className="text-sm text-primary-600 font-medium mb-2">
                {product.category}
              </p>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {product.name}
              </h1>

              {/* Rating */}
              {(() => {
                const rating = calculateRating();
                return (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(rating.average)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {rating.average.toFixed(1)} ({rating.count} reviews)
                    </span>
                  </div>
                );
              })()}

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6 flex-wrap">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${(product.discountedPrice || product.price)?.toFixed(2)}
                </span>
                {product.comparePrice > 0 && (
                  <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                    ${product.comparePrice?.toFixed(2)}
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="text-sm bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-2 py-1 rounded">
                    Save ${(product.comparePrice - (product.discountedPrice || product.price))?.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Short Description */}
              <div className="mb-6">
                {renderFormattedDescription(product.description?.slice(0, 300))}
              </div>
            </div>

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Color: {selectedColor?.name}
                </h3>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor?.name === color.name
                          ? 'border-primary-600 scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Size: {selectedSize}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size.name)}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        selectedSize === size.name
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'border-gray-300 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="flex flex-wrap gap-4 mb-8">
              {/* Quantity Selector */}
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium text-gray-900 dark:text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 min-w-[200px] bg-primary-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </motion.button>

              {/* Add Review */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowReviewModal(true)}
                className="flex-1 min-w-[200px] bg-yellow-500 text-white py-3 px-8 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
              >
                <Star className="w-5 h-5" />
                Add Review
              </motion.button>

              {/* Wishlist */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToWishlist}
                className="p-3 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-white"
              >
                <Heart className="w-5 h-5" />
              </motion.button>

              {/* Share */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-white"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Free Shipping
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Secure Payment
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  30-Day Returns
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-8">
              {['description', 'specifications', `reviews (${productReviews.length})`].map((tab, idx) => (
                <button
                  key={['description', 'specifications', 'reviews'][idx]}
                  onClick={() => setActiveTab(['description', 'specifications', 'reviews'][idx])}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors capitalize ${
                    activeTab === ['description', 'specifications', 'reviews'][idx]
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'description' && (
                  <div className="prose dark:prose-invert max-w-none">
                    {renderFormattedDescription(product.description)}
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {product.dimensions && (
                      <>
                        <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Length</span>
                          <span className="font-medium">{product.dimensions.length} cm</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Width</span>
                          <span className="font-medium">{product.dimensions.width} cm</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Height</span>
                          <span className="font-medium">{product.dimensions.height} cm</span>
                        </div>
                      </>
                    )}
                    {product.weight && (
                      <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Weight</span>
                        <span className="font-medium">{product.weight} kg</span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">SKU</span>
                      <span className="font-medium">{product.sku || 'N/A'}</span>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {productReviews.length === 0 ? (
                      <p className="text-gray-600 dark:text-gray-400">
                        No reviews yet. Be the first to review this product!
                      </p>
                    ) : (
                      productReviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                          <div className="flex items-start gap-4">
                            {review.user?.avatar ? (
                              <img
                                src={review.user.avatar}
                                alt={review.user.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                                  {(review.user?.name || review.name || 'A').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {review.user?.name || review.name}
                                </h4>
                                {review.verifiedPurchase && (
                                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-0.5 rounded">
                                    Verified Purchase
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="text-sm text-gray-500 ml-2">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {/* Product Title */}
                              <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-1">
                                {review.product?.name || product?.name || 'Product'}
                              </p>
                              <p className="text-gray-700 dark:text-gray-300">
                                {review.comment}
                              </p>
                              {review.detailB && (
                                <p className="text-sm text-gray-500 mt-2">
                                  Detail B: {review.detailB}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Your Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Profile + Name + Stars */}
              <div className="flex items-center gap-3">
                {/* Profile */}
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {reviewForm.photo ? (
                    <img src={URL.createObjectURL(reviewForm.photo)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-semibold text-primary-600 dark:text-primary-400">
                      {(reviewForm.name || 'A').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {/* Name + Stars */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm mb-1"
                    placeholder="Your name"
                    required
                  />
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= (hoverRating || reviewForm.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Photo Upload (hidden) */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                  <Upload className="w-4 h-4" />
                  <span className="text-xs">{reviewForm.photo ? reviewForm.photo.name : 'Add photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Product Title */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 p-4 rounded-xl border border-primary-200 dark:border-primary-700">
                <label className="block text-xs font-medium text-primary-600 dark:text-primary-400 mb-1 uppercase tracking-wide">Product</label>
                <p className="text-lg font-bold text-primary-800 dark:text-primary-300">
                  {product?.name || 'Product'}
                </p>
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review Details</label>
                <textarea
                  value={reviewForm.details}
                  onChange={(e) => setReviewForm({ ...reviewForm, details: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows="4"
                  placeholder="Write your review here..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                Submit Review
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && product?.images && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={product.images[selectedImage] || '/placeholder-product.jpg'}
                alt={`${product.name} - ${selectedImage + 1}`}
                className="max-w-full max-h-[90vh] object-contain"
              />
            </motion.div>

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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
