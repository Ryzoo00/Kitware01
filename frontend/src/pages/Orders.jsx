import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  ChevronRight,
  Truck,
  CheckCircle,
  Clock,
  X,
  MapPin,
  CreditCard,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Shipped':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'Processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'Cancelled':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="section-padding py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            My Orders
          </h1>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No orders yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start shopping to see your orders here
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Browse Products
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Order #{order._id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="flex items-center gap-4 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex -space-x-2">
                    {order.orderItems.slice(0, 3).map((item, index) => (
                      <img
                        key={index}
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover border-2 border-white dark:border-gray-800"
                      />
                    ))}
                    {order.orderItems.length > 3 && (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                        +{order.orderItems.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.orderItems.length} item
                      {order.orderItems.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    ${order.totalPrice.toFixed(2)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Order Details
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Order Number
                    </p>
                    <p className="font-medium">#{selectedOrder._id.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Order Date
                    </p>
                    <p className="font-medium">
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        selectedOrder.status
                      )}`}
                    >
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total
                    </p>
                    <p className="font-bold text-lg">
                      ${selectedOrder.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold mb-4">Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
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
                  <h3 className="font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Subtotal</span>
                      <span>${selectedOrder.itemsPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Shipping</span>
                      <span>${selectedOrder.shippingPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Tax</span>
                      <span>${selectedOrder.taxPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${selectedOrder.discountAmount?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                        <span>Total</span>
                        <span>${selectedOrder.totalPrice?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>
                      {selectedOrder.shippingAddress.city},{' '}
                      {selectedOrder.shippingAddress.state}{' '}
                      {selectedOrder.shippingAddress.zipCode}
                    </p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>

                {/* Payment */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </h3>
                  <p className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {selectedOrder.paymentMethod}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
