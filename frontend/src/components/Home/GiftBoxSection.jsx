import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import giftBackground from '../gift background/Robot cuisine rentrée _ 20 recettes pour rentabiliser votre achat.jfif';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const GiftBoxSection = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Default fallback data
  const defaultProduct = {
    name: 'Elegant Wooden Handle Stainless Steel Utensil Set',
    images: [
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&q=80',
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    ],
    discount: 30,
    productId: '67ed61cdf766f473eb7596aa',
    firstOfferDescription: 'Get an exclusive discount on our premium',
    secondOfferDescription: 'kitchen collection. Valid until March 24th only!',
  };

  useEffect(() => {
    fetchFeaturedSpecialProduct();
  }, []);

  const fetchFeaturedSpecialProduct = async () => {
    try {
      console.log('Fetching featured special product...');
      const response = await axios.get(`${API_URL}/special-products?isFeatured=true&isActive=true`);
      console.log('API Response:', response.data);

      if (response.data?.data && response.data.data.length > 0) {
        const product = response.data.data[0];
        console.log('Found featured product:', product);
        setFeaturedProduct({
          name: product.title,
          images: product.images || [],
          discount: product.discount || 30,
          productId: product._id,
          firstOfferDescription: product.firstOfferDescription || 'Get an exclusive discount on our premium',
          secondOfferDescription: product.secondOfferDescription || 'collection. Limited time offer!',
          category: product.category,
        });
      } else {
        console.log('No featured products found, using default');
      }
    } catch (error) {
      console.error('Error fetching featured special product:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Use featured product if available, otherwise default
  const promoProduct = featuredProduct || defaultProduct;

  // Ensure images array is valid
  const productImages = promoProduct.images && promoProduct.images.length > 0
    ? promoProduct.images
    : defaultProduct.images;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  // Reset image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [promoProduct.productId]);

  if (isLoading) {
    return (
      <section className="py-10 px-3">
        <div className="max-w-none mx-auto px-0">
          <div className="flex items-center justify-center min-h-[300px] bg-gray-100 dark:bg-gray-800 rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 px-3">
      <div className="max-w-none mx-auto px-0">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Special
          </h2>
          <div className="w-24 h-1 bg-primary-500 mt-2 rounded-full"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Product Image with Frame */}
            <div className="relative h-full min-h-[300px] sm:min-h-[350px] lg:min-h-[450px] p-2 sm:p-3 bg-white dark:bg-gray-800">
              <div className="relative w-full h-full rounded-lg overflow-hidden shadow-md border border-gray-100 dark:border-gray-700">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={productImages[currentImageIndex]}
                    alt={promoProduct.name}
                    onError={(e) => { e.target.src = defaultProduct.images[0]; }}
                    className="absolute inset-0 w-full h-full object-cover p-0 m-0 scale-110"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
              </div>
              
              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700 transition-all z-10"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700 transition-all z-10"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentImageIndex === index
                        ? 'w-6 bg-white'
                        : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right Side - Transparent Content */}
            <div className="relative flex flex-col justify-center p-4 sm:p-6 lg:p-12 z-10">
              {/* Gift background image fully visible with blur */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm"
                style={{
                  backgroundImage: `url(${giftBackground})`,
                }}
              ></div>

              <div className="relative z-10">
                <motion.h3
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                >
                  Special Surprise!
                </motion.h3>

                <motion.h4
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-lg sm:text-xl lg:text-2xl font-medium mb-4 sm:mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  style={{ fontFamily: "'Dancing Script', cursive", color: '#fbbf24' }}
                >
                  Premium 8PCS Stainless Steel Cooker Set!
                </motion.h4>

                {/* Shop Now Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6"
                >
                  <Link
                    to="/gift-products"
                    className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-white text-gray-900 px-4 sm:px-6 py-3 sm:py-3 font-semibold text-sm hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    <span>SHOP NOW</span>
                    <div className="bg-yellow-500 p-1.5">
                      <ShoppingCart className="w-4 h-4 text-white" />
                    </div>
                  </Link>
                </motion.div>

                {/* Description + Discount */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                >
                  Upgrade your kitchen with this Premium 8PCS Stainless Steel Cooker Set! Durable, stylish, and perfect for everyday cooking with even heat distribution and long-lasting quality 🍲✨ <span className="font-bold text-yellow-400">Save 40% OFF up to May 5</span>
                </motion.p>
              </div>

              {/* More Button - Bottom Right */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="mt-4 sm:mt-6 lg:mt-0 lg:absolute lg:bottom-6 lg:right-6 relative z-20"
              >
                <button
                  onClick={() => navigate('/gift-products#special-collection')}
                  className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-4 sm:px-6 py-3 sm:py-2.5 font-semibold text-sm hover:bg-gray-100 transition-colors w-full sm:w-auto relative z-20 cursor-pointer active:scale-95"
                >
                  MORE
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GiftBoxSection;
