import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Grid, List, ChevronDown, SlidersHorizontal, Star } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/Products/ProductCard';
import Sidebar from '../components/Products/Sidebar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    featured: searchParams.get('featured') || '',
    trending: searchParams.get('trending') || '',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt',
  });

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.page]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.featured) params.append('featured', filters.featured);
      if (filters.trending) params.append('trending', filters.trending);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      params.append('sort', filters.sort);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await axios.get(`${API_URL}/products?${params.toString()}`);
      setProducts(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/reviews`);
      if (response.data.success && response.data.data.length > 0) {
        setReviews(response.data.data.slice(0, 6));
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (sort) => {
    setFilters((prev) => ({ ...prev, sort }));
  };

  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: '-price', label: 'Price: High to Low' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-ratings.average', label: 'Highest Rated' },
    { value: '-salesCount', label: 'Best Sellers' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="section-padding py-8 max-w-7xl mx-auto">
        {/* Breadcrumb & Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {filters.search ? `Search: "${filters.search}"` : 
             filters.category ? `${filters.category} Products` : 
             'All Products'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {pagination.total} products available
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Sidebar filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-white"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters</span>
                </button>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={filters.sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-lg px-4 py-2 pr-10 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer text-gray-700 dark:text-white"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value} className="text-gray-700 dark:text-white bg-white dark:bg-gray-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Filter Panel */}
            {isMobileFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden mb-6"
              >
                <Sidebar filters={filters} onFilterChange={handleFilterChange} />
              </motion.div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={`grid gap-4 lg:gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && products.length > 0 && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>

                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPagination((prev) => ({ ...prev, page: i + 1 }))}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      pagination.page === i + 1
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Customer Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                    {review.details}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                        {review.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {review.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
