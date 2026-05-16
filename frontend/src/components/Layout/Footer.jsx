import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  MapPin,
  Phone,
  CreditCard,
  Truck,
  Shield,
  RotateCcw,
  Globe,
  Share2,
  MessageCircle,
  Video,
  Star,
  X,
  Upload,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: '',
    rating: 0,
    details: '',
    photo: null,
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [displayedReviews, setDisplayedReviews] = useState([]);

  useEffect(() => {
    fetchDisplayedReviews();
  }, []);

  const fetchDisplayedReviews = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/site-reviews`);
      if (response.data.success) {
        setDisplayedReviews(response.data.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const formData = new FormData();
      formData.append('name', reviewForm.name);
      formData.append('email', reviewForm.email);
      formData.append('rating', reviewForm.rating);
      formData.append('details', reviewForm.details);
      
      if (reviewForm.photo) {
        formData.append('photo', reviewForm.photo);
      }

      const response = await axios.post(`${API_URL}/site-reviews`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        alert(response.data.message || 'Thank you for your review!');
        setShowReviewModal(false);
        setReviewForm({ name: '', email: '', rating: 0, details: '', photo: null });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to submit review. Please try again.');
    }
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setReviewForm({ ...reviewForm, photo: e.target.files[0] });
    }
  };

  const footerLinks = {
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Shop', path: '/products' },
      { name: 'Special Products', path: '/special-products' },
      { name: 'Careers', path: '/careers' },
      { name: 'Blog', path: '/blog' },
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Returns', path: '/returns' },
      { name: 'Shipping Info', path: '/shipping' },
      { name: 'Track Order', path: '/track' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'Accessibility', path: '/accessibility' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Globe, url: '#' },
    { name: 'Instagram', icon: MessageCircle, url: '#' },
    { name: 'Twitter', icon: Share2, url: '#' },
    { name: 'YouTube', icon: Video, url: '#' },
  ];

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
    { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
    { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
    { icon: CreditCard, title: 'Best Prices', desc: 'Guaranteed low prices' },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      {/* Features Bar */}
      <div className="border-b border-gray-800">
        <div className="section-padding py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{feature.title}</h4>
                    <p className="text-sm text-gray-400">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="section-padding py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/" className="inline-block">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">KIT</span>
                <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Dancing Script', cursive" }}>ware</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors text-sm whitespace-nowrap"
              >
                Add Site Review
              </button>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              Your premier destination for luxury home goods, kitchen essentials, 
              and lifestyle products. Quality meets elegance in every piece.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span>123 Commerce Street, New York, NY 10001</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary-400" />
                <span>support@luxeliving.com</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter & Social */}
      <div className="border-t border-gray-800">
        <div className="section-padding py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Newsletter */}
            <div className="flex-1 max-w-md w-full">
              <h4 className="text-white font-semibold mb-2">Subscribe to our newsletter</h4>
              <p className="text-gray-400 text-sm mb-4">
                Get the latest updates on new products and upcoming sales
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2 flex-wrap">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors text-sm whitespace-nowrap"
                >
                  {subscribed ? 'Subscribed!' : 'Subscribe'}
                </button>
              </form>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="section-padding py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>© 2024 KITware. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-gray-300 transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-gray-300 transition-colors">
                Terms
              </Link>
              <Link to="/sitemap" className="hover:text-gray-300 transition-colors">
                Sitemap
              </Link>
            </div>
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
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={reviewForm.email}
                  onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoverRating || reviewForm.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Photo
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Upload className="w-5 h-5" />
                    <span className="text-sm">{reviewForm.photo ? reviewForm.photo.name : 'Choose photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Review Details
                </label>
                <textarea
                  value={reviewForm.details}
                  onChange={(e) => setReviewForm({ ...reviewForm, details: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows="4"
                  placeholder="Write your review here..."
                  required
                />
              </div>

              {/* Submit Button */}
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
    </footer>
  );
};

export default Footer;
