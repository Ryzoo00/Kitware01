import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Truck,
  Check,
  Package,
  Clock,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, debouncedSearch, statusFilter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      // Fetch all orders, we'll filter client-side for better search
      params.append('page', '1');
      params.append('limit', '1000'); // Fetch all orders for client-side filtering
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`${API_URL}/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      let allOrders = response.data.data || [];
      
      // Client-side filtering with partial matching
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        allOrders = allOrders.filter(order => {
          const idMatch = order._id?.toLowerCase().includes(searchLower);
          const shortIdMatch = order._id?.slice(-8).toLowerCase().includes(searchLower);
          const nameMatch = order.user?.name?.toLowerCase().includes(searchLower);
          const emailMatch = order.user?.email?.toLowerCase().includes(searchLower);
          const itemMatch = order.orderItems?.some(item => 
            item.name?.toLowerCase().includes(searchLower)
          );
          return idMatch || shortIdMatch || nameMatch || emailMatch || itemMatch;
        });
        
        // Sort by relevance - orders with ID match first
        allOrders.sort((a, b) => {
          const idA = a._id?.toLowerCase() || '';
          const idB = b._id?.toLowerCase() || '';
          const searchLower = debouncedSearch.toLowerCase();
          
          // Orders with ID starting with search term come first
          const aIdStartsWith = idA.startsWith(searchLower);
          const bIdStartsWith = idB.startsWith(searchLower);
          
          if (aIdStartsWith && !bIdStartsWith) return -1;
          if (!aIdStartsWith && bIdStartsWith) return 1;
          
          // Then by ID containing search term
          const aIdIncludes = idA.includes(searchLower);
          const bIdIncludes = idB.includes(searchLower);
          
          if (aIdIncludes && !bIdIncludes) return -1;
          if (!aIdIncludes && bIdIncludes) return 1;
          
          // Then by how early the match appears in ID
          const aIdIndex = idA.indexOf(searchLower);
          const bIdIndex = idB.indexOf(searchLower);
          
          if (aIdIndex !== -1 && bIdIndex !== -1) {
            return aIdIndex - bIdIndex;
          }
          
          return 0;
        });
      }
      
      // Manual pagination for filtered results
      const itemsPerPage = 10;
      const totalItems = allOrders.length;
      const totalPagesCalc = Math.ceil(totalItems / itemsPerPage) || 1;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedOrders = allOrders.slice(startIndex, startIndex + itemsPerPage);
      
      setOrders(paginatedOrders);
      setTotalPages(totalPagesCalc);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        { status: newStatus, note: `Status updated to ${newStatus}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order status updated');
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Order deleted successfully');
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setIsModalOpen(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <Check className="w-4 h-4" />;
      case 'Shipped':
        return <Truck className="w-4 h-4" />;
      case 'Processing':
        return <Clock className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage customer orders
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
              placeholder="Search by order ID, customer name, email, or product..."
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 h-11 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        >
          <option value="">All Statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Search Results Info */}
      {debouncedSearch && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {isLoading ? (
              'Searching...'
            ) : (
              <>
                Found <span className="font-semibold text-primary-600">{orders.length}</span> order{orders.length !== 1 ? 's' : ''} 
                matching "<span className="font-medium">{debouncedSearch}</span>"
              </>
            )}
          </span>
          {!isLoading && orders.length > 0 && totalPages > 1 && (
            <span className="text-sm text-gray-500">
              (Page {currentPage} of {totalPages})
            </span>
          )}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
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
                    <td colSpan={7} className="px-6 py-4">
                      <div className="animate-pulse h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    {debouncedSearch ? (
                      <div>
                        <p className="text-gray-500 mb-2">No orders found matching "{debouncedSearch}"</p>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          Clear search
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-500">No orders found</p>
                    )}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      #{order._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {order.user?.name || 'Guest'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {order.orderItems.length} items
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsModalOpen(true);
                        }}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Delete
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

      {/* Order Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Order #{selectedOrder._id.slice(-8)}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Update */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Status:
                </span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover aspect-square flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 items-center justify-center hidden">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                        {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
                        {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                      </div>
                      <p className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span>${selectedOrder.itemsPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span>${selectedOrder.shippingPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span>${selectedOrder.taxPrice.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-${selectedOrder.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span>Total</span>
                    <span>${selectedOrder.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                    {selectedOrder.shippingAddress.zipCode}
                  </p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                  <p>{selectedOrder.contactInfo?.phone}</p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-semibold mb-2">Payment Method</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedOrder.paymentMethod}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
