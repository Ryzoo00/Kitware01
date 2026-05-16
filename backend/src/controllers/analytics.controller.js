import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';
import { Coupon } from '../models/coupon.model.js';
import SiteReview from '../models/siteReview.model.js';
import SpecialProduct from '../models/specialProduct.model.js';
import Hero from '../models/hero.model.js';

// Helper function to get date range
const getDateRange = (period) => {
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case '24h':
    case '1d':
      startDate.setHours(now.getHours() - 24);
      break;
    case '7d':
    case '7days':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
    case '30days':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
    case '90days':
      startDate.setDate(now.getDate() - 90);
      break;
    case '1y':
    case '1year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case 'all':
    default:
      startDate = new Date('2020-01-01'); // All time
  }
  
  return { startDate, endDate: now };
};

// @desc    Get analytics overview
// @route   GET /api/analytics/overview
// @access  Admin
export const getAnalyticsOverview = async (req, res, next) => {
  try {
    const { period = '7days' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    const prevPeriodStart = new Date(startDate);
    const prevPeriodEnd = new Date(endDate);
    const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    prevPeriodStart.setDate(prevPeriodStart.getDate() - daysDiff);
    prevPeriodEnd.setDate(prevPeriodEnd.getDate() - daysDiff);
    
    // Current period stats
    const currentOrders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $nin: ['Cancelled', 'Refunded'] }
    });
    
    const currentRevenue = currentOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const currentOrderCount = currentOrders.length;
    
    // Previous period stats for comparison
    const prevOrders = await Order.find({
      createdAt: { $gte: prevPeriodStart, $lte: prevPeriodEnd },
      status: { $nin: ['Cancelled', 'Refunded'] }
    });
    
    const prevRevenue = prevOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const prevOrderCount = prevOrders.length;
    
    // Calculate changes
    const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersChange = prevOrderCount > 0 ? ((currentOrderCount - prevOrderCount) / prevOrderCount) * 100 : 0;
    
    // User stats
    const currentUsers = await User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
    const totalUsers = await User.countDocuments();
    const prevUsers = await User.countDocuments({ createdAt: { $gte: prevPeriodStart, $lte: prevPeriodEnd } });
    const usersChange = prevUsers > 0 ? ((currentUsers - prevUsers) / prevUsers) * 100 : 0;
    
    // Product stats
    const totalProducts = await Product.countDocuments();
    const totalSpecialProducts = await SpecialProduct.countDocuments();
    const totalHeroes = await Hero.countDocuments();
    const totalSiteReviews = await SiteReview.countDocuments();
    const totalCoupons = await Coupon.countDocuments();
    
    // Total all-time orders (for dashboard display)
    const allTimeOrders = await Order.countDocuments();
    const allTimeRevenue = await Order.aggregate([
      { $match: { status: { $nin: ['Cancelled', 'Refunded'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    // Order status breakdown
    const orderStatusCounts = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Revenue by payment method
    const revenueByPayment = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, status: { $nin: ['Cancelled', 'Refunded'] } } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$totalPrice' }, count: { $sum: 1 } } }
    ]);
    
    // Daily revenue trend
    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, status: { $nin: ['Cancelled', 'Refunded'] } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const avgOrderValue = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
    
    res.json({
      success: true,
      data: {
        totalRevenue: currentRevenue,
        totalOrders: currentOrderCount,
        allTimeOrders,
        allTimeRevenue: allTimeRevenue[0]?.total || 0,
        totalUsers,
        totalProducts: totalProducts + totalSpecialProducts,
        totalHeroes,
        totalSiteReviews,
        totalCoupons,
        revenueChange: Number(revenueChange.toFixed(2)),
        ordersChange: Number(ordersChange.toFixed(2)),
        usersChange: Number(usersChange.toFixed(2)),
        avgOrderValue: Number(avgOrderValue.toFixed(2)),
        conversionRate: 3.2, // Placeholder - would need visitor data
        customerRetention: 68.5, // Placeholder
        orderStatusBreakdown: orderStatusCounts,
        revenueByPayment,
        dailyRevenue,
        period,
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales data with time series
// @route   GET /api/analytics/sales
// @access  Admin
export const getSalesAnalytics = async (req, res, next) => {
  try {
    const { period = '7days' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $nin: ['Cancelled', 'Refunded'] }
    }).sort('createdAt');
    
    // Group by date
    const salesByDate = {};
    
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = { sales: 0, orders: 0, visitors: 0 };
      }
      salesByDate[date].sales += order.totalPrice || 0;
      salesByDate[date].orders += 1;
    });
    
    // Fill in missing dates
    const result = [];
    let current = new Date(startDate);
    
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const dayName = current.toLocaleDateString('en-US', { weekday: 'short' });
      
      result.push({
        date: dateStr,
        name: dayName,
        sales: salesByDate[dateStr]?.sales || 0,
        orders: salesByDate[dateStr]?.orders || 0,
        visitors: Math.floor(Math.random() * 500) + 200 // Placeholder
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category analytics
// @route   GET /api/analytics/categories
// @access  Admin
export const getCategoryAnalytics = async (req, res, next) => {
  try {
    const { period = '7days' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $nin: ['Cancelled', 'Refunded'] }
    }).populate('orderItems.product');
    
    const categoryStats = {};
    
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const category = item.product?.category || 'Uncategorized';
        if (!categoryStats[category]) {
          categoryStats[category] = { sales: 0, orders: 0 };
        }
        categoryStats[category].sales += (item.price || 0) * (item.quantity || 1);
        categoryStats[category].orders += item.quantity || 1;
      });
    });
    
    const colors = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];
    
    const result = Object.entries(categoryStats).map(([name, stats], index) => ({
      name,
      value: stats.orders,
      sales: stats.sales,
      color: colors[index % colors.length]
    }));
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top products
// @route   GET /api/analytics/top-products
// @access  Admin
export const getTopProducts = async (req, res, next) => {
  try {
    const { period = '7days', limit = 10 } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $nin: ['Cancelled', 'Refunded'] }
    }).populate('orderItems.product');
    
    const productStats = {};
    
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const productId = item.product?._id?.toString();
        if (!productId) return;
        
        if (!productStats[productId]) {
          productStats[productId] = {
            name: item.name || item.product?.name,
            sales: 0,
            revenue: 0
          };
        }
        productStats[productId].sales += item.quantity || 1;
        productStats[productId].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    
    const result = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, Number(limit));
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user analytics
// @route   GET /api/analytics/users
// @access  Admin
export const getUserAnalytics = async (req, res, next) => {
  try {
    const { period = '7days' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    // New users by date
    const users = await User.find({ createdAt: { $gte: startDate, $lte: endDate } }).sort('createdAt');
    
    const usersByDate = {};
    users.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0];
      usersByDate[date] = (usersByDate[date] || 0) + 1;
    });
    
    // Fill missing dates
    const result = [];
    let current = new Date(startDate);
    
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        newUsers: usersByDate[dateStr] || 0
      });
      current.setDate(current.getDate() + 1);
    }
    
    // User roles distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      data: {
        newUsers: result,
        roleDistribution,
        totalUsers: await User.countDocuments(),
        activeUsers: await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comprehensive analytics
// @route   GET /api/analytics/all
// @access  Admin
export const getAllAnalytics = async (req, res, next) => {
  try {
    const { period = '7days' } = req.query;
    
    const [overview, sales, categories, topProducts, users] = await Promise.all([
      getAnalyticsOverviewData(period),
      getSalesAnalyticsData(period),
      getCategoryAnalyticsData(period),
      getTopProductsData(period),
      getUserAnalyticsData(period)
    ]);
    
    res.json({
      success: true,
      data: {
        overview,
        sales,
        categories,
        topProducts,
        users,
        period
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions for internal use
const getAnalyticsOverviewData = async (period) => {
  const { startDate, endDate } = getDateRange(period);
  
  const orders = await Order.find({
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $nin: ['Cancelled', 'Refunded'] }
  });
  
  const revenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const avgOrderValue = orders.length > 0 ? revenue / orders.length : 0;
  
  return {
    totalRevenue: revenue,
    totalOrders: orders.length,
    totalUsers: await User.countDocuments(),
    totalProducts: await Product.countDocuments() + await SpecialProduct.countDocuments(),
    avgOrderValue: Number(avgOrderValue.toFixed(2)),
    conversionRate: 3.2,
    customerRetention: 68.5
  };
};

const getSalesAnalyticsData = async (period) => {
  const { startDate, endDate } = getDateRange(period);
  
  const orders = await Order.find({
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $nin: ['Cancelled', 'Refunded'] }
  }).sort('createdAt');
  
  const salesByDate = {};
  orders.forEach(order => {
    const date = order.createdAt.toISOString().split('T')[0];
    if (!salesByDate[date]) {
      salesByDate[date] = { sales: 0, orders: 0 };
    }
    salesByDate[date].sales += order.totalPrice || 0;
    salesByDate[date].orders += 1;
  });
  
  const result = [];
  let current = new Date(startDate);
  
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    const dayName = current.toLocaleDateString('en-US', { weekday: 'short' });
    result.push({
      name: dayName,
      sales: salesByDate[dateStr]?.sales || 0,
      orders: salesByDate[dateStr]?.orders || 0
    });
    current.setDate(current.getDate() + 1);
  }
  
  return result;
};

const getCategoryAnalyticsData = async (period) => {
  const { startDate, endDate } = getDateRange(period);
  
  const orders = await Order.find({
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $nin: ['Cancelled', 'Refunded'] }
  }).populate('orderItems.product');
  
  const categoryStats = {};
  
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      const category = item.product?.category || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = { sales: 0, orders: 0 };
      }
      categoryStats[category].sales += (item.price || 0) * (item.quantity || 1);
      categoryStats[category].orders += item.quantity || 1;
    });
  });
  
  const colors = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
  
  return Object.entries(categoryStats).map(([name, stats], index) => ({
    name,
    value: stats.orders,
    sales: stats.sales,
    color: colors[index % colors.length]
  }));
};

const getTopProductsData = async (period, limit = 5) => {
  const { startDate, endDate } = getDateRange(period);
  
  const orders = await Order.find({
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $nin: ['Cancelled', 'Refunded'] }
  }).populate('orderItems.product');
  
  const productStats = {};
  
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      const name = item.name || item.product?.name || 'Unknown';
      if (!productStats[name]) {
        productStats[name] = { name, sales: 0, revenue: 0 };
      }
      productStats[name].sales += item.quantity || 1;
      productStats[name].revenue += (item.price || 0) * (item.quantity || 1);
    });
  });
  
  return Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
};

const getUserAnalyticsData = async (period) => {
  const { startDate, endDate } = getDateRange(period);
  
  const newUsers = await User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
  const totalUsers = await User.countDocuments();
  
  return {
    newUsers,
    totalUsers,
    activeUsers: await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
  };
};
