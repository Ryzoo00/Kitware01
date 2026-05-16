import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Sidebar = ({ filters, onFilterChange }) => {
  const [categories, setCategories] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: false,
  });
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || 0,
    max: filters.maxPrice || 1000,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryClick = (categoryId) => {
    onFilterChange({
      category: filters.category === categoryId ? '' : categoryId,
    });
  };

  const handlePriceChange = (type, value) => {
    const newPriceRange = { ...priceRange, [type]: Number(value) };
    setPriceRange(newPriceRange);
    onFilterChange({
      minPrice: newPriceRange.min,
      maxPrice: newPriceRange.max,
    });
  };

  const clearFilters = () => {
    setPriceRange({ min: 0, max: 1000 });
    onFilterChange({
      category: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full mb-4"
        >
          <h4 className="font-medium text-gray-900 dark:text-white">Categories</h4>
          {expandedSections.categories ? (
            <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>

        {expandedSections.categories && (
          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.category === category.name}
                  onChange={() => handleCategoryClick(category.name)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className={`text-sm transition-colors ${
                  filters.category === category.name
                    ? 'text-primary-600 font-medium'
                    : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                }`}>
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full mb-4"
        >
          <h4 className="font-medium text-gray-900 dark:text-white">Price Range</h4>
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>

        {expandedSections.price && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Min</label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <span className="text-gray-400 dark:text-gray-500 mt-5">-</span>
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Max</label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="1000"
                />
              </div>
            </div>

            {/* Range Slider */}
            <div className="pt-2">
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>$0</span>
                <span>$1000+</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full mb-4"
        >
          <h4 className="font-medium text-gray-900 dark:text-white">Rating</h4>
          {expandedSections.rating ? (
            <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>

        {expandedSections.rating && (
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                    {rating}+ Stars
                  </span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="pt-2">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Active Filters</h4>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-full">
                {filters.category}
                <button
                  onClick={() => onFilterChange({ category: '' })}
                  className="hover:text-primary-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-full">
                ${filters.minPrice || 0} - ${filters.maxPrice || '1000+'}
                <button
                  onClick={() => {
                    setPriceRange({ min: 0, max: 1000 });
                    onFilterChange({ minPrice: '', maxPrice: '' });
                  }}
                  className="hover:text-primary-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
