import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Home,
  ShoppingCart,
  Heart,
  User,
  LayoutDashboard,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useLocation } from 'react-router-dom';

const MobileNav = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { cart } = useCartStore();
  const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Cart', path: '/cart', icon: ShoppingCart, badge: itemCount },
    { name: 'Wishlist', path: '/wishlist', icon: Heart },
    { name: 'Profile', path: isAuthenticated ? '/profile' : '/login', icon: User },
  ];

  // Don't show on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 lg:hidden z-40"
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                active
                  ? 'text-primary-600'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default MobileNav;
