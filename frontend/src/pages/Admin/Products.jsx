import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Image,
  Check,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DescriptionPreview from '../../components/Admin/DescriptionPreview';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const MAX_IMAGES = 5;
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    category: '',
    stock: '',
    sku: '',
    isActive: true,
    isFeatured: false,
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, debouncedSearch]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      // Fetch all products, we'll filter client-side for better search
      params.append('page', currentPage.toString());
      params.append('limit', '100'); // Fetch more products for client-side filtering

      const response = await axios.get(`${API_URL}/products?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      let allProducts = response.data.data;
      
      // Client-side filtering with partial matching
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        allProducts = allProducts.filter(product => {
          const nameMatch = product.name?.toLowerCase().includes(searchLower);
          const skuMatch = product.sku?.toLowerCase().includes(searchLower);
          const categoryMatch = product.category?.toLowerCase().includes(searchLower);
          return nameMatch || skuMatch || categoryMatch;
        });
        
        // Sort by relevance - products starting with search term first
        allProducts.sort((a, b) => {
          const nameA = a.name?.toLowerCase() || '';
          const nameB = b.name?.toLowerCase() || '';
          
          const aStartsWith = nameA.startsWith(searchLower);
          const bStartsWith = nameB.startsWith(searchLower);
          
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          
          // Then by how early the match appears
          const aIndex = nameA.indexOf(searchLower);
          const bIndex = nameB.indexOf(searchLower);
          
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }
          
          return 0;
        });
      }
      
      // Manual pagination for filtered results
      const itemsPerPage = 10;
      const totalItems = allProducts.length;
      const totalPagesCalc = Math.ceil(totalItems / itemsPerPage) || 1;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedProducts = allProducts.slice(startIndex, startIndex + itemsPerPage);
      
      setProducts(paginatedProducts);
      setTotalPages(totalPagesCalc);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTrending = async (id) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Debug logging
      
      if (!token) {
        toast.error('Please login again - token not found');
        return;
      }
      
      const response = await axios.put(`${API_URL}/products/${id}/trending`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      toast.success(response.data.message);
      fetchProducts();
    } catch (error) {
      console.error('Toggle trending error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to toggle trending status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for multipart/form-data (includes files)
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('description', formData.description);
      formDataObj.append('price', Number(formData.price));
      formDataObj.append('comparePrice', formData.comparePrice ? Number(formData.comparePrice) : 0);
      formDataObj.append('category', formData.category);
      formDataObj.append('stock', Number(formData.stock));
      formDataObj.append('sku', formData.sku || '');
      formDataObj.append('isActive', formData.isActive);
      formDataObj.append('isFeatured', formData.isFeatured);
      
      // Append images to FormData
      selectedImages.forEach((file) => {
        formDataObj.append('images', file);
      });

      // If editing and no new images selected, preserve existing images
      if (editingProduct && selectedImages.length === 0 && imagePreviewUrls.length > 0) {
        imagePreviewUrls.forEach((url) => {
          formDataObj.append('existingImages', url);
        });
      }

      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct._id}`, formDataObj, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API_URL}/products`, formDataObj, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        });
        toast.success('Product created successfully');
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      category: '',
      stock: '',
      sku: '',
      isActive: true,
      isFeatured: false,
    });
    setSelectedImages([]);
    setImagePreviewUrls([]);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      comparePrice: product.comparePrice?.toString() || '',
      category: product.category,
      stock: product.stock.toString(),
      sku: product.sku || '',
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    });
    setSelectedImages([]);
    setImagePreviewUrls(product.images || []);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = MAX_IMAGES - selectedImages.length;
    
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    
    const filesToAdd = files.slice(0, remainingSlots);
    const newPreviewUrls = filesToAdd.map(file => URL.createObjectURL(file));
    
    setSelectedImages(prev => [...prev, ...filesToAdd]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
    if (files.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} image(s) added. Maximum ${MAX_IMAGES} images allowed.`);
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const categories = ['Kitchen', 'Dining', 'Accessories', 'Storage', 'Essentials', 'Electronics', 'Fashion', 'Home Decor', 'Gifts'];

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your product inventory
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => window.location.reload()}
            className="p-2.5 h-11 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Refresh page"
          >
            <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          <input
            type="text"
            placeholder="Search products by name, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 h-11 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
          />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      {debouncedSearch && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {isLoading ? (
              'Searching...'
            ) : (
              <>
                Found <span className="font-semibold text-primary-600">{products.length}</span> product{products.length !== 1 ? 's' : ''} 
                matching "<span className="font-medium">{debouncedSearch}</span>"
              </>
            )}
          </span>
          {!isLoading && products.length > 0 && totalPages > 1 && (
            <span className="text-sm text-gray-500">
              (Page {currentPage} of {totalPages})
            </span>
          )}
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="animate-pulse h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    {debouncedSearch ? (
                      <div>
                        <p className="text-gray-500 mb-2">No products found matching "{debouncedSearch}"</p>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          Clear search
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-500">No products found</p>
                    )}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square flex-shrink-0">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover aspect-square"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center ${product.images?.[0] ? 'hidden' : 'flex'}`}>
                            <Image className="w-6 h-6 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis" title={product.name}>
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">{product.sku || 'No SKU'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.category}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ${product.price.toFixed(2)}
                        </p>
                        {product.comparePrice > 0 && (
                          <p className="text-sm text-gray-500 line-through">
                            ${product.comparePrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.isActive ? (
                          <>
                            <Check className="w-3 h-3" /> Active
                          </>
                        ) : (
                          'Inactive'
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleTrending(product._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            product.isTrending
                              ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                          title={product.isTrending ? 'Remove from Trending' : 'Add to Trending'}
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingProduct ? 'Edit Product' : 'Create Product'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-yellow-500 outline-none"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        const template = `Product Name: Your catchy tagline here! 🔪🥣💥

Powerful performance: With a 1000W motor and a large 5.0L capacity, this chopper can chop, grind, and blend large batches in minutes. 🥩🥦 Its steel bearing head and powerful motor make it extremely durable. ✨⚙️

Precision cutting: Its gold-plated dual-level stainless steel blades guarantee the best precision and consistent texture—from chops to mince. 👌🏆

Conveniences for you:
🚚 Delivery across Pakistan: Order from home.
💰 Great discounts: Deals and special discounts on every product.
🔄 Easy returns (7-day return policy): If you don't like the product or have any problems.
✅ 12-month warranty: One-year warranty with German design and technology.

Simplify your kitchen work and order your Product today! 🏆🥗✨`;
                        setFormData({ ...formData, description: template });
                      }}
                      className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-3 py-1.5 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                    >
                      📝 Use Description Template
                    </button>
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-yellow-500 outline-none text-sm"
                    placeholder="Enter product description with emojis and formatting..."
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    💡 Tip: Use line breaks, emojis (🚚💰✅), and end section headers with colon (:) for automatic formatting
                  </p>
                  {/* Live Preview */}
                  <div className="mt-4">
                    <DescriptionPreview description={formData.description} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-yellow-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Compare at Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-yellow-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-yellow-500 outline-none"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-yellow-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-yellow-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-yellow-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-yellow-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
                  </label>
                </div>

                {/* Image Upload Section */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Images (Max {MAX_IMAGES})
                  </label>
                  <div className="flex items-center gap-4 flex-wrap">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                        <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {selectedImages.length < MAX_IMAGES && (
                      <label className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Plus className="w-6 h-6 text-gray-400" />
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageSelect}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedImages.length} / {MAX_IMAGES} images selected
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
