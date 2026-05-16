import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Upload,
  X,
  ArrowUp,
  ArrowDown,
  Save
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Heroes = () => {
  const [heroes, setHeroes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchHeroes();
  }, []);

  const fetchHeroes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/heroes`);
      if (response.data.success) {
        setHeroes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching heroes:', error);
      toast.error('Failed to fetch heroes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('order', formData.order);
    data.append('isActive', formData.isActive);
    
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      const token = localStorage.getItem('token');
      let response;

      if (editingHero) {
        response = await axios.put(`${API_URL}/heroes/${editingHero._id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Hero updated successfully');
      } else {
        response = await axios.post(`${API_URL}/heroes`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Hero created successfully');
      }

      if (response.data.success) {
        fetchHeroes();
        closeModal();
      }
    } catch (error) {
      console.error('Error saving hero:', error);
      toast.error(error.response?.data?.message || 'Failed to save hero');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hero image?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/heroes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Hero deleted successfully');
        fetchHeroes();
      }
    } catch (error) {
      console.error('Error deleting hero:', error);
      toast.error('Failed to delete hero');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${API_URL}/heroes/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Hero status updated');
        fetchHeroes();
      }
    } catch (error) {
      console.error('Error toggling hero status:', error);
      toast.error('Failed to update hero status');
    }
  };

  const openCreateModal = () => {
    setEditingHero(null);
    setFormData({
      order: heroes.length,
      isActive: true
    });
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (hero) => {
    setEditingHero(hero);
    setFormData({
      order: hero.order,
      isActive: hero.isActive
    });
    setImagePreview(hero.imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHero(null);
    setImagePreview(null);
  };

  const moveOrder = async (hero, direction) => {
    const newHeroes = [...heroes];
    const currentIndex = newHeroes.findIndex(h => h._id === hero._id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= newHeroes.length) return;

    // Swap orders
    const tempOrder = newHeroes[currentIndex].order;
    newHeroes[currentIndex].order = newHeroes[targetIndex].order;
    newHeroes[targetIndex].order = tempOrder;

    // Update in backend
    try {
      const token = localStorage.getItem('token');
      await Promise.all([
        axios.put(`${API_URL}/heroes/${newHeroes[currentIndex]._id}`, 
          { order: newHeroes[currentIndex].order },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.put(`${API_URL}/heroes/${newHeroes[targetIndex]._id}`, 
          { order: newHeroes[targetIndex].order },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ]);
      
      setHeroes(newHeroes.sort((a, b) => a.order - b.order));
      toast.success('Order updated');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hero Background Images</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage homepage hero carousel background images
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchHeroes}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Image
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{heroes.length}</p>
              <p className="text-sm text-gray-500">Total Images</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {heroes.filter(h => h.isActive).length}
              </p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {heroes.filter(h => !h.isActive).length}
              </p>
              <p className="text-sm text-gray-500">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Heroes List */}
      {heroes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No hero images yet</p>
          <p className="text-sm text-gray-400 mt-2">Click "Add Image" to upload your first hero background</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {heroes.sort((a, b) => a.order - b.order).map((hero, index) => (
            <motion.div
              key={hero._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image Preview */}
                <div className="md:w-64 h-48 md:h-auto relative">
                  <img
                    src={hero.imageUrl}
                    alt="Hero background"
                    className="w-full h-full object-cover"
                  />
                  {!hero.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-medium">Inactive</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs font-medium rounded">
                          Order: {hero.order}
                        </span>
                        {hero.isActive ? (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hero Background Image</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                        This image will be used as the background for the hero carousel
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveOrder(hero, 'up')}
                          disabled={index === 0}
                          className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveOrder(hero, 'down')}
                          disabled={index === heroes.length - 1}
                          className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleToggleStatus(hero._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          hero.isActive
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 hover:bg-orange-200'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200'
                        }`}
                        title={hero.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {hero.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openEditModal(hero)}
                        className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(hero._id)}
                        className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingHero ? 'Edit Hero Image' : 'Add Hero Image'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Background Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-yellow-500 transition-colors relative">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData({ ...formData, image: null });
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        Choose File
                      </label>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload-hidden"
                  />
                  {!imagePreview && (
                    <label
                      htmlFor="image-upload-hidden"
                      className="absolute inset-0 cursor-pointer"
                    ></label>
                  )}
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                  Active (show on homepage)
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 tambeple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Save className="w-4 h-4" />
                  {editingHero ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Heroes;
