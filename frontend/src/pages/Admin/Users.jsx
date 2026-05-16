import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Mail,
  Shield,
  UserX,
  Check,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearch, roleFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Check if token exists
      if (!token) {
        toast.error('Please login to access user management');
        navigate('/login');
        return;
      }
      
      const params = new URLSearchParams();
      // Fetch all users, we'll filter client-side for better search
      params.append('page', '1');
      params.append('limit', '1000'); // Fetch all users for client-side filtering
      if (roleFilter) params.append('role', roleFilter);

      const response = await axios.get(`${API_URL}/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      let allUsers = response.data.data || [];
      
      // Client-side filtering with partial matching
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        allUsers = allUsers.filter(user => {
          const nameMatch = user.name?.toLowerCase().includes(searchLower);
          const emailMatch = user.email?.toLowerCase().includes(searchLower);
          const idMatch = user._id?.toLowerCase().includes(searchLower);
          return nameMatch || emailMatch || idMatch;
        });
        
        // Sort by relevance - users starting with search term first
        allUsers.sort((a, b) => {
          const nameA = a.name?.toLowerCase() || '';
          const nameB = b.name?.toLowerCase() || '';
          
          const aStartsWith = nameA.startsWith(searchLower);
          const bStartsWith = nameB.startsWith(searchLower);
          
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          
          // Then by how early the match appears in name
          const aIndex = nameA.indexOf(searchLower);
          const bIndex = nameB.indexOf(searchLower);
          
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }
          
          // If no name match, check email
          const emailA = a.email?.toLowerCase() || '';
          const emailB = b.email?.toLowerCase() || '';
          const emailAIndex = emailA.indexOf(searchLower);
          const emailBIndex = emailB.indexOf(searchLower);
          
          if (emailAIndex !== -1 && emailBIndex !== -1) {
            return emailAIndex - emailBIndex;
          }
          
          return 0;
        });
      }
      
      // Manual pagination for filtered results
      const itemsPerPage = 10;
      const totalItems = allUsers.length;
      const totalPagesCalc = Math.ceil(totalItems / itemsPerPage) || 1;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedUsers = allUsers.slice(startIndex, startIndex + itemsPerPage);
      
      setUsers(paginatedUsers);
      setTotalPages(totalPagesCalc);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch users');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/users/${userId}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('User role updated');
        fetchUsers();
        if (selectedUser?._id === userId) {
          setSelectedUser({ ...selectedUser, role: newRole });
        }
      } else {
        toast.error(response.data.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Role update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/users/${userId}`,
        { isBlocked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success(isBlocked ? 'User blocked' : 'User unblocked');
        fetchUsers();
        if (selectedUser?._id === userId) {
          setSelectedUser({ ...selectedUser, isBlocked });
        }
      } else {
        toast.error(response.data.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Block user error:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('User deleted successfully');
      fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user accounts
          </p>
        </div>
      </div>

      {/* Filters */}
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
            placeholder="Search users by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 h-11 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
          />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            )}
          </div>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 h-11 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Search Results Info */}
      {debouncedSearch && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isLoading ? (
              'Searching...'
            ) : (
              <>
                Found <span className="font-semibold text-primary-600 dark:text-primary-400">{users.length}</span> user{users.length !== 1 ? 's' : ''} 
                matching "<span className="font-medium dark:text-gray-300">{debouncedSearch}</span>"
              </>
            )}
          </span>
          {!isLoading && users.length > 0 && totalPages > 1 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              (Page {currentPage} of {totalPages})
            </span>
          )}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Joined
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    {debouncedSearch ? (
                      <div>
                        <p className="text-gray-500 mb-2">No users found matching "{debouncedSearch}"</p>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          Clear search
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-500">No users found</p>
                    )}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <div className="relative">
                            <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 p-[2px]">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full rounded-full object-cover border-2 border-white"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium border-2 border-white shadow-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          user.isBlocked
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        }`}
                      >
                        {user.isBlocked ? (
                          <>
                            <UserX className="w-3 h-3" /> Blocked
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3" /> Active
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsModalOpen(true);
                        }}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium text-sm"
                      >
                        Manage
                      </button>
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

      {/* User Detail Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  User Details
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                {selectedUser.avatar ? (
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 p-[3px]">
                      <img
                        src={selectedUser.avatar}
                        alt={selectedUser.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl font-bold border-2 border-white shadow-md">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedUser.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => handleRoleUpdate(selectedUser._id, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Status
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBlockUser(selectedUser._id, false)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                      !selectedUser.isBlocked
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => handleBlockUser(selectedUser._id, true)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                      selectedUser.isBlocked
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Blocked
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleDeleteUser(selectedUser._id)}
                  className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
