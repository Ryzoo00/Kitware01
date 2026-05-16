import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../Products/ProductCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      console.log('📦 Fetching featured products...');
      const response = await axios.get(`${API_URL}/products?limit=20&sort=-createdAt`);
      console.log('✅ Featured products fetched:', response.data.data?.length || 0, 'products');
      console.log('First product:', response.data.data?.[0]);
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('❌ Failed to fetch featured products:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    const maxIndex = products.length - 2; // Slide by 1, so max index is length - 2
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [products.length]);

  const prevSlide = useCallback(() => {
    const maxIndex = products.length - 2;
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  }, [products.length]);

  if (isLoading) {
    return (
      <section className="section-padding py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-10 px-3 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-none mx-auto px-0">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-xl font-bold text-gray-900 dark:text-white mb-1"
            >
              Featured Products
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xs text-gray-600 dark:text-gray-400"
            >
              Handpicked selection of our finest items
            </motion.p>
          </div>

          {/* Navigation Arrows - Desktop & Mobile */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all hover:scale-105"
              aria-label="Previous products"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all hover:scale-105"
              aria-label="Next products"
            >
              <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Mobile: Elevator Carousel - 2 products visible, slide by 1 | Desktop: Static 4 products */}
        {isMobile ? (
          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-3"
              animate={{ x: `calc(-${currentIndex} * (50% + 6px))` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              {products.map((product) => (
                <div key={product._id} className="w-[calc(50%-6px)] flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-3"
              animate={{ x: `calc(-${currentIndex} * (25% + 9px))` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              {products.map((product) => (
                <div key={product._id} className="w-[calc(25%-6.75px)] flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
