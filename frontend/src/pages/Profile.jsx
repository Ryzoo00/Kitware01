import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  Package,
  Heart,
  Settings,
  Camera,
  Sparkles,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const { user, updateUser, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [joinedSpecialProducts, setJoinedSpecialProducts] = useState([]);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setAvatarLoading(true);
    console.log('Starting avatar upload...', { fileName: file.name, fileSize: file.size, fileType: file.type });
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      const formData = new FormData();
      formData.append('avatar', file);

      console.log('Sending request to:', `${API_URL}/users/avatar`);
      
      const response = await axios.put(
        `${API_URL}/users/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      updateUser({ avatar: response.data.data.avatar });
      toast.success('Profile picture updated!');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to upload avatar';
      toast.error(`Avatar upload failed: ${errorMsg}`);
      console.error('Avatar upload error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const fetchJoinedSpecialProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/special-products?isActive=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter products where user has joined
      const joined = response.data.data.filter(product => 
        product.participants?.some(p => p.user?._id === user?._id)
      );
      setJoinedSpecialProducts(joined);
    } catch (error) {
      console.error('Error fetching joined special products:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'special-products') {
      fetchJoinedSpecialProducts();
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/users/profile/me`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateUser(response.data.data);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package, path: '/orders' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, path: '/wishlist' },
    { id: 'special-products', label: 'Special Products', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const stats = [
    { icon: Package, label: 'Orders', value: 12 },
    { icon: Heart, label: 'Wishlist', value: 8 },
    { icon: MapPin, label: 'Addresses', value: 2 },
  ];

  return (
    <div className="section-padding py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          My Profile
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.name}
                    className="w-full h-full rounded-full object-cover border-4 border-primary-200"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-4xl font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarLoading}
                  className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {avatarLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user?.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                {user?.email}
              </p>

              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="text-center">
                      <Icon className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Menu */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  if (item.path) {
                    return (
                      <a
                        key={item.id}
                        href={item.path}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 transition-colors"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{item.label}</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </a>
                    );
                  }
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        activeTab === item.id
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.label}</span>
                      {activeTab === item.id && <div className="w-2 h-2 rounded-full bg-primary-600 ml-auto" />}
                    </button>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="md:col-span-2">
            {activeTab === 'profile' && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Personal Information
                    </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user?.name || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                        });
                      }}
                      className="flex items-center gap-2 text-gray-500 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </div>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white font-medium">
                      {user?.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </div>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white font-medium">
                      {user?.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </div>
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="Add phone number"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white font-medium">
                      {user?.phone || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mt-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Account Settings
                  </h3>
                  <div className="space-y-4">
                    <button className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between">
                      <span className="font-medium">Change Password</span>
                      <span className="text-primary-600">Update</span>
                    </button>
                    <button className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between text-red-600">
                      <span className="font-medium">Delete Account</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'special-products' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  My Special Products
                </h3>
                {joinedSpecialProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-gray-600 mb-4">You haven&apos;t joined any special products yet</p>
                    <a
                      href="/special-products"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
                    >
                      Browse Special Products
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {joinedSpecialProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                      >
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{product.title}</h4>
                          <p className="text-sm text-gray-500">{product.category}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Trophy className="w-3 h-3 text-yellow-500" />
                              1st: {product.firstPrize}
                            </span>
                            <span className="flex items-center gap-1">
                              <Gift className="w-3 h-3 text-purple-500" />
                              2nd: {product.secondPrize}
                            </span>
                          </div>
                        </div>
                        <a
                          href={`/special-products`}
                          className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Settings
                </h3>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notifications</h4>
                    <p className="text-sm text-gray-500 mb-4">Manage your notification preferences</p>
                    <button className="text-primary-600 font-medium text-sm">Configure</button>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Privacy</h4>
                    <p className="text-sm text-gray-500 mb-4">Manage your privacy settings</p>
                    <button className="text-primary-600 font-medium text-sm">Configure</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
