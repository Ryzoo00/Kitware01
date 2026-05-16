import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard, ShoppingBag, Users, ShoppingCart, BarChart3, Settings,
  LogOut, Menu, X, Bell, Search, ChevronDown, ChevronLeft, ChevronRight, User,
  DollarSign, Package, AlertCircle, Star, Moon, Sun, FileText, Sparkles, Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import logoImage from '../../components/logo/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const notificationRef = useRef(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Order Received', message: 'Order #ORD-4521 from John Doe - $145.99', time: '2 min ago', read: false, type: 'order' },
    { id: 2, title: 'Low Stock Alert', message: 'Wireless Headphones (SKU: WH-001) only 3 left', time: '15 min ago', read: false, type: 'alert' },
    { id: 3, title: 'New 5-Star Review', message: 'Sarah Smith rated Smart Watch Pro 5 stars', time: '1 hour ago', read: true, type: 'review' },
    { id: 4, title: 'Payment Successful', message: 'Invoice #INV-7823 paid by Acme Corp', time: '3 hours ago', read: true, type: 'order' },
    { id: 5, title: 'New User Registered', message: 'Mike Johnson signed up as a new customer', time: '5 hours ago', read: true, type: 'user' },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [entityCounts, setEntityCounts] = useState({
    products: 0,
    orders: 0,
    users: 0,
    specialProducts: 0,
  });

  // Fetch entity counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [productsRes, ordersRes, usersRes, specialProductsRes] = await Promise.all([
          axios.get(`${API_URL}/products?page=1&limit=1`, { headers }),
          axios.get(`${API_URL}/orders?page=1&limit=1`, { headers }),
          axios.get(`${API_URL}/users?page=1&limit=1`, { headers }),
          axios.get(`${API_URL}/special-products?page=1&limit=1`, { headers }),
        ]);

        setEntityCounts({
          products: productsRes.data.pagination?.total || 0,
          orders: ordersRes.data.pagination?.total || 0,
          users: usersRes.data.pagination?.total || 0,
          specialProducts: specialProductsRes.data.pagination?.total || 0,
        });
      } catch (error) {
        console.error('Error fetching entity counts:', error);
      }
    };

    fetchCounts();
  }, []);

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, count: null },
    { path: '/admin/products', label: 'Products', icon: ShoppingBag, count: entityCounts.products },
    { path: '/admin/special-products', label: 'Special Products', icon: Sparkles, count: entityCounts.specialProducts },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingCart, count: entityCounts.orders },
    { path: '/admin/users', label: 'Users', icon: Users, count: entityCounts.users },
    { path: '/admin/site-reviews', label: 'Site Reviews', icon: Star, count: null },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3, count: null },
    { path: '/admin/heroes', label: 'Heroes', icon: ImageIcon, count: null },
    { path: '/admin/reports', label: 'Reports', icon: FileText, count: null },
    { path: '/admin/settings', label: 'Settings', icon: Settings, count: null },
  ];

  const quickStats = [
    { label: 'Sales', value: '$48,250', change: '+12.5%', icon: DollarSign, color: 'bg-green-500' },
    { label: 'Orders', value: '1,284', change: '+8.2%', icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Users', value: '8,420', change: '+15.3%', icon: Users, color: 'bg-amber-500' },
    { label: 'Products', value: '256', change: '-2.1%', icon: Package, color: 'bg-orange-500' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Click outside to close notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Desktop Sidebar - Simplified without motion */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-xl z-50 flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-[280px]' : 'w-[80px]'
        }`}
      >
        {/* Logo */}
        <div className="h-24 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 px-4">
          <div className="flex items-center gap-3">
            {sidebarOpen ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <img 
                  src={logoImage} 
                  alt="LuxeLiving Logo" 
                  className="h-16 w-auto object-contain"
                />
              </motion.div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 via-amber-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <img 
                  src={logoImage} 
                  alt="LuxeLiving Logo" 
                  className="h-10 w-auto object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                {sidebarOpen && (
                  <span className="font-medium whitespace-nowrap flex-1">{item.label}</span>
                )}
                {sidebarOpen && item.count !== null && (
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    isActive 
                      ? 'bg-white/30 text-white' 
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {item.count}
                  </span>
                )}
                {isActive && sidebarOpen && !item.count && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Quick Stats</p>
            <div className="grid grid-cols-2 gap-2">
              {quickStats.slice(0, 2).map((stat) => (
                <div key={stat.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
                    <span className="text-xs text-gray-500">{stat.label}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="lg:hidden fixed left-0 top-0 h-full w-70 bg-white dark:bg-gray-800 shadow-2xl z-50"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 via-amber-500 to-amber-500 rounded-xl flex items-center justify-center">
                    <LayoutDashboard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg text-gray-900 dark:text-white">LuxeLiving</h1>
                    <p className="text-xs text-gray-500">Admin</p>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path ||
                    (item.path !== '/admin' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-yellow-500 text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-[80px]'}`}>
        {/* Error Boundary Test */}
        {console.log('AdminLayout - User:', user, 'Sidebar Open:', sidebarOpen)}
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 lg:px-6 py-4 flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
              <div className="hidden md:block">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                </h2>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="hidden md:flex items-center">
                <AnimatePresence>
                  {showSearch ? (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 280, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="relative"
                    >
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search anything..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        autoFocus
                      />
                      <button
                        onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => setShowSearch(true)}
                      className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                      <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  )}
                </AnimatePresence>
              </div>

              {/* Dark Mode */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Notifications</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{unreadCount} unread messages</p>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-yellow-600 hover:text-yellow-700 font-medium px-3 py-1.5 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => markNotificationAsRead(notif.id)}
                              className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                                !notif.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg flex-shrink-0 ${
                                  notif.type === 'order' ? 'bg-green-100 text-green-600' :
                                  notif.type === 'alert' ? 'bg-red-100 text-red-600' :
                                  notif.type === 'user' ? 'bg-amber-100 text-amber-600' :
                                  'bg-blue-100 text-blue-600'
                                }`}>
                                  {notif.type === 'order' ? <ShoppingCart className="w-4 h-4" /> :
                                   notif.type === 'alert' ? <AlertCircle className="w-4 h-4" /> :
                                   notif.type === 'user' ? <Users className="w-4 h-4" /> :
                                   <Star className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</p>
                                    {!notif.read && (
                                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-700/30">
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Administrator' : 'Manager'}</p>
                </div>
                <div className="relative group">
                  <button className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-yellow-500 tambeple-600 flex items-center justify-center text-white font-medium shadow-lg ring-2 ring-white dark:ring-gray-800">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold">{user?.name?.charAt(0) || 'A'}</span>
                    )}
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Admin'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'admin@luxeliving.com'}</p>
                    </div>
                    <div className="p-1">
                      <Link to="/admin/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link to="/admin/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
