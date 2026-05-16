import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RecentProductReviews = () => {
  const [reviews, setReviews] = useState([]);
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
    fetchRecentReviews();
  }, []);

  const fetchRecentReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/reviews?limit=9&sort=-createdAt`);
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    const maxIndex = isMobile ? reviews.length - 1 : reviews.length - 3;
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    const maxIndex = isMobile ? reviews.length - 1 : reviews.length - 3;
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse h-40 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
            >
              <MessageSquare className="w-6 h-6 text-primary-600" />
              Recent Product Reviews
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 dark:text-gray-400 mt-1"
            >
              See what customers are saying about our products
            </motion.p>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-white dark:bg-gray-700 shadow hover:shadow-md transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-white dark:bg-gray-700 shadow hover:shadow-md transition-all"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Reviews Carousel */}
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-4"
            animate={{
              x: isMobile
                ? `calc(-${currentIndex} * (100% + 16px))`
                : `calc(-${currentIndex} * (33.333% + 16px))`,
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {reviews.map((review, index) => (
              <div
                key={review._id}
                className={`flex-shrink-0 ${
                  isMobile ? 'w-full' : 'w-[calc(33.333%-11px)]'
                }`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => review.product?._id && navigate(`/product/${review.product._id}`)}
                  className="bg-white dark:bg-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer h-full"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                        {(review.user?.name || review.name || 'A').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {review.user?.name || review.name || 'Anonymous'}
                      </h4>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>

                  {/* Product Name */}
                  <p className="text-primary-600 dark:text-primary-400 font-medium text-sm mb-2 line-clamp-1">
                    {review.product?.name || 'Product'}
                  </p>

                  {/* Review Text */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-3">
                    {review.comment}
                  </p>

                  {/* Date */}
                  <p className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({
            length: isMobile ? reviews.length : Math.max(1, reviews.length - 2),
          }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex
                  ? 'bg-primary-600 w-6'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentProductReviews;
