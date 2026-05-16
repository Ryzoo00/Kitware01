import Hero from '../components/Home/Hero';
import GiftBoxSection from '../components/Home/GiftBoxSection';
import TrendingProducts from '../components/Home/TrendingProducts';
import CustomerReviews from '../components/Home/CustomerReviews';
import ProductCard from '../components/Products/ProductCard';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products?limit=20&sort=-createdAt`);
      const productsData = response.data.data || [];
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    const productsPerView = isMobile ? 2 : 4;
    const maxIndex = products.length - productsPerView;
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    const productsPerView = isMobile ? 2 : 4;
    const maxIndex = products.length - productsPerView;
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Products</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/products')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View All →
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all hover:scale-105"
                aria-label="Previous products"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all hover:scale-105"
                aria-label="Next products"
              >
                <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-3 md:gap-6"
            animate={{ x: isMobile ? `calc(-${currentIndex} * (50% + 6px))` : `calc(-${currentIndex} * (25% + 18px))` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {products.map((product) => (
              <div key={product._id} className="w-[calc(50%-6px)] md:w-[calc(25%-18px)] flex-shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <AllProducts />
      <GiftBoxSection />
      <TrendingProducts />
      <CustomerReviews />
    </motion.div>
  );
};

export default Home;
