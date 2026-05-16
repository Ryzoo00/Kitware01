import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Check,
  X,
  Trash2,
  User,
  Mail,
  MessageSquare,
  Calendar,
  Image,
  RefreshCw,
  Eye,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SiteReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch approved reviews
      const approvedRes = await axios.get(`${API_URL}/site-reviews`);
      if (approvedRes.data.success) {
        setReviews(approvedRes.data.data);
      }

      // Fetch pending reviews
      const pendingRes = await axios.get(`${API_URL}/site-reviews/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (pendingRes.data.success) {
        setPendingReviews(pendingRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/site-reviews/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Review approved successfully');
        fetchReviews();
      }
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve review');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/site-reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Review deleted successfully');
        fetchReviews();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const openReviewDetail = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayReviews = activeTab === 'pending' ? pendingReviews : reviews;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Site Reviews</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage customer reviews and ratings
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reviews.length}</p>
              <p className="text-sm text-gray-500">Approved Reviews</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingReviews.length}</p>
              <p className="text-sm text-gray-500">Pending Reviews</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {reviews.length > 0 
                  ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
                  : '0.0'}
              </p>
              <p className="text-sm text-gray-500">Average Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'pending'
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          Pending ({pendingReviews.length})
          {activeTab === 'pending' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'approved'
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          Approved ({reviews.length})
          {activeTab === 'approved' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
            />
          )}
        </button>
      </div>

      {/* Reviews List */}
      {displayReviews.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === 'pending' ? 'No pending reviews' : 'No approved reviews yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {displayReviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {review.photo?.url ? (
                    <img
                      src={review.photo.url}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{review.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-sm text-gray-500">{review.rating}/5</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{review.email}</p>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{review.details}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeTab === 'pending' && (
                    <button
                      onClick={() => handleApprove(review._id)}
                      className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {activeTab === 'approved' && (
                    <button
                      onClick={() => {
                        toast.success('Show review on site');
                        openReviewDetail(review);
                      }}
                      className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Show"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => openReviewDetail(review)}
                    className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 transition-colors"
                    title="View Details"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Review Detail Modal */}
      {isModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Review Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selectedReview.photo?.url ? (
                  <img
                    src={selectedReview.photo.url}
                    alt={selectedReview.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{selectedReview.name}</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(selectedReview.rating)}</div>
                    <span className="text-sm text-gray-500">{selectedReview.rating}/5</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  {selectedReview.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedReview.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">{selectedReview.details}</p>
              </div>

              {selectedReview.photo?.url && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photo</p>
                  <img
                    src={selectedReview.photo.url}
                    alt="Review"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {activeTab === 'pending' && (
                  <button
                    onClick={() => {
                      handleApprove(selectedReview._id);
                      setIsModalOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedReview._id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SiteReviews;
