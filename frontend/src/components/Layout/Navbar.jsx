import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  LayoutDashboard,
} from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const { wishlist, fetchWishlist } = useWishlistStore();

  const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.length || 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchFocused(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/products' },
    { name: 'Deals', path: '/products?featured=true' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
          : 'bg-white dark:bg-gray-900'
      }`}
    >
      <div className="section-padding">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mr-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">KIT</span>
              <span className="text-2xl font-bold text-black" style={{ fontFamily: "'Dancing Script', cursive" }}>ware</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium whitespace-nowrap transition-colors duration-200 hover:text-primary-600 ${
                  location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
                    ? 'text-primary-600'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className={`hidden lg:flex items-center flex-1 max-w-md mx-8 relative transition-all duration-300 ${
              isSearchFocused ? 'scale-105' : ''
            }`}
          >
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-4 pr-12 py-2.5 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200"
            />
            <button
              type="submit"
              className="absolute right-2 p-2 text-gray-500 hover:text-primary-600 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </motion.button>

            {/* Wishlist */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden sm:flex relative"
            >
              <Link
                to="/wishlist"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative flex items-center justify-center"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* Cart */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative"
            >
              <Link
                to="/cart"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative flex items-center justify-center"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* Profile / Login */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  title={user?.email || 'User Profile'}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary-500"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium text-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                      {user?.name}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 max-w-[100px] truncate">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.button>

                {/* Debug: Log user info */}
                {console.log('Navbar - User:', user, 'Role:', user?.role, 'Is Authenticated:', isAuthenticated)}

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                      {/* User Info Header */}
                      <div className="p-4 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-500" />
                          My Profile
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-gray-500" />
                          My Wishlist
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Package className="w-4 h-4 text-gray-500" />
                          My Orders
                        </Link>

                        {/* Role or Admin Dashboard */}
                        {user?.role === 'admin' ? (
                          <Link
                            to="/admin"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 transition-colors font-medium"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        ) : (
                          <div className="px-4 py-2">
                            <span className="text-xs text-gray-400">Role: {user?.role || 'user'}</span>
                          </div>
                        )}
                      </div>

                      {/* Logout Button */}
                      <div className="border-t border-gray-100 p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
          >
            <div className="section-padding py-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Mobile Nav Links */}
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                
                {isAuthenticated && (
                  <Link
                    to="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-3 px-4 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    My Wishlist ({wishlistCount})
                  </Link>
                )}
                {!isAuthenticated && (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-3 px-4 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-3 px-4 rounded-lg font-medium bg-primary-600 text-white text-center hover:bg-primary-700 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
