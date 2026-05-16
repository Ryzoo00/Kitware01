import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fallback images if API fails
const fallbackHeroImages = [
  { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80', alt: 'Modern Kitchen' },
  { url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1920&q=80', alt: 'Elegant Dining' },
  { url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80', alt: 'Home Decor' },
];

const rotatingPhrases = [
  'Premium Quality',
  'Modern Design',
  'Chef Essentials',
  'Easy Cooking',
  'Quality Products',
  'Daily Ease',
];

const TypewriterText = ({ phrases, typingSpeed = 100, deletingSpeed = 50, pauseDuration = 2000 }) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timeout;
    const currentPhrase = phrases[currentPhraseIndex];

    if (isPaused) {
      timeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
    } else if (isTyping && !isDeleting) {
      if (displayText.length < currentPhrase.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        setIsPaused(true);
      }
    } else if (isDeleting) {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setIsTyping(true);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, isDeleting, isPaused, currentPhraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className="text-primary-400 inline-block min-w-[120px] sm:min-w-[160px] md:min-w-[200px] text-[75%]">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroImages, setHeroImages] = useState(fallbackHeroImages);

  useEffect(() => {
    fetchHeroes();
  }, []);

  const fetchHeroes = async () => {
    try {
      const response = await axios.get(`${API_URL}/heroes?isActive=true`);
      if (response.data.success && response.data.data.length > 0) {
        const heroes = response.data.data.map(hero => ({
          url: `${hero.imageUrl}?t=${new Date(hero.updatedAt).getTime()}`,
          alt: 'Hero background'
        }));
        setHeroImages(heroes);
      }
    } catch (error) {
      console.error('Error fetching heroes:', error);
      // Use fallback images if API fails
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="relative h-[500px] lg:h-[600px] overflow-hidden">
      {heroImages.map((img, index) => (
        <motion.div
          key={index}
          initial={{ x: '100%' }}
          animate={{
            x: index === currentSlide ? '0%' : index === (currentSlide - 1 + heroImages.length) % heroImages.length ? '-100%' : '100%',
            opacity: index === currentSlide ? 1 : 0
          }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </motion.div>
      ))}

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-xl text-white">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
          >
            <span className="block sm:inline font-['Cabin_Sketch']">Transform Your Home With</span>{' '}
            <TypewriterText phrases={rotatingPhrases} />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-gray-200 mb-6 sm:mb-8"
          >
            Explore our curated collection of kitchen essentials and home decor.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-500 text-white text-sm sm:text-base font-semibold rounded-full hover:bg-primary-600 transition-colors"
            >
              Shop Now <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
