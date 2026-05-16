import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
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
    fetchReviews();
  }, []);

  // Auto-scroll every 4 seconds - smooth infinite loop
  useEffect(() => {
    if (reviews.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = isMobile ? reviews.length - 1 : reviews.length - 3;
        if (prev >= maxIndex) {
          return 0;
        }
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [reviews.length, isMobile]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/site-reviews`);
      setReviews(response.data.data);
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
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <section className="py-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    // Show demo reviews when no data from API
    setReviews([
      { _id: '1', name: 'Asad Khan', email: 'asad@example.com', rating: 5, details: 'Ya maire website hai - Great experience shopping here!', createdAt: new Date().toISOString() },
      { _id: '2', name: 'Asad Khan', email: 'asad@example.com', rating: 4, details: 'Ya bohat acha website hai - Highly recommend this store!', createdAt: new Date().toISOString() },
      { _id: '3', name: 'John Doe', email: 'john@example.com', rating: 5, details: 'Excellent quality products and fast delivery!', createdAt: new Date().toISOString() }
    ]);
    setIsLoading(false);
  }

  return (
    <section className="py-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-3"
          >
            What Our Customers Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Real feedback from our valued customers about their shopping experience
          </motion.p>
        </div>

        {/* Reviews Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none z-10 px-2">
            <button
              onClick={prevSlide}
              className="pointer-events-auto p-3 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transition-all hover:scale-105 -ml-4"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={nextSlide}
              className="pointer-events-auto p-3 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transition-all hover:scale-105 -mr-4"
              aria-label="Next review"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Carousel Container */}
          <div className="overflow-hidden py-8 px-4">
            <motion.div
              className="flex items-stretch"
              style={{ gap: '16px' }}
              animate={{
                x: isMobile
                  ? `${-currentIndex * 100}%`
                  : `${-currentIndex * (100 / 3 + 0.5)}%`,
              }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {reviews.map((review, index) => {
                const isMiddle = isMobile
                  ? index === currentIndex
                  : index === currentIndex + 1;
                return (
                <div
                  key={review._id}
                  className={`flex-shrink-0 ${
                    isMobile ? 'w-full' : 'w-[calc(33.333%-11px)]'
                  } ${isMiddle ? 'scale-[1.02] z-10' : 'scale-100'} transition-transform duration-500`}>
                  <div className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg transition-all h-full relative ${isMiddle ? 'shadow-xl ring-2 ring-primary-500/20' : 'shadow-md'}`}>
                    <div className="flex gap-4 relative">
                      {/* Profile Photo */}
                      {review.photo ? (
                        <img
                          src={review.photo.url}
                          alt={review.name}
                          className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-semibold text-primary-600 dark:text-primary-400">
                            {review.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Name */}
                        <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">
                          {review.name}
                        </h4>

                        {/* Rating with number */}
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-0.5">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {review.rating}/5
                          </span>
                        </div>

                        {/* Email */}
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          {review.email}
                        </p>

                        {/* Review Text */}
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-2">
                          {review.details}
                        </p>

                        {/* Date */}
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      {/* KITware Logo */}
                      <div className="absolute bottom-3 right-3">
                        <span className="text-xs font-bold tracking-tight">
                          <span className="text-primary-600">KIT</span>
                          <span className="text-gray-600 dark:text-gray-400">ware</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );})}
            </motion.div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
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
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
