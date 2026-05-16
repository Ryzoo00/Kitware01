import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Target,
  Download, RefreshCw, ArrowUpRight, ArrowDownRight,
  Activity, BarChart2, PieChart as PieChartIcon,
  Radar as RadarIcon, Funnel as FunnelIcon,
  Globe, Clock, Smartphone, Map, Heart, Receipt, Calendar,
  Package, Star, Image, Tag, CreditCard
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, FunnelChart, Funnel, LabelList, Brush } from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const timeRanges = [
  { id: '24h', label: '24 Hours', shortLabel: '24h' },
  { id: '1d', label: '1 Day', shortLabel: '1D' },
  { id: '7d', label: '7 Days', shortLabel: '7D' },
  { id: '30d', label: '30 Days', shortLabel: '30D' },
  { id: '90d', label: '3 Months', shortLabel: '3M' },
  { id: '1y', label: '1 Year', shortLabel: '1Y' },
  { id: 'all', label: 'All Time', shortLabel: 'All' },
];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [chartType, setChartType] = useState('composed');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Real data states
  const [overview, setOverview] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalHeroes: 0,
    totalSiteReviews: 0,
    totalCoupons: 0,
    revenueChange: 0,
    ordersChange: 0,
    usersChange: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    customerRetention: 0,
    orderStatusBreakdown: [],
    revenueByPayment: [],
    dailyRevenue: [],
  });
  
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [userStats, setUserStats] = useState({ newUsers: [], roleDistribution: [], totalUsers: 0, activeUsers: 0 });

  // Fetch all analytics data
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [overviewRes, salesRes, categoriesRes, productsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/overview?period=${timeRange}`, { headers }),
        axios.get(`${API_URL}/analytics/sales?period=${timeRange}`, { headers }),
        axios.get(`${API_URL}/analytics/categories?period=${timeRange}`, { headers }),
        axios.get(`${API_URL}/analytics/top-products?period=${timeRange}&limit=5`, { headers }),
        axios.get(`${API_URL}/analytics/users?period=${timeRange}`, { headers }),
      ]);

      setOverview(overviewRes.data.data);
      setSalesData(salesRes.data.data);
      setCategoryData(categoriesRes.data.data);
      setTopProducts(productsRes.data.data);
      setUserStats(usersRes.data.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const refreshData = () => {
    fetchAnalytics();
  };

  const exportData = () => {
    const data = {
      overview,
      salesData,
      categoryData,
      topProducts,
      userStats,
      exportedAt: new Date().toISOString(),
      period: timeRange
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate KPI cards from real data
  const kpiCards = [
    { 
      title: 'Total Revenue', 
      value: `$${overview.totalRevenue?.toLocaleString() || 0}`, 
      change: `${overview.revenueChange >= 0 ? '+' : ''}${overview.revenueChange}%`, 
      icon: DollarSign, 
      color: 'from-green-500 to-emerald-600', 
      positive: overview.revenueChange >= 0 
    },
    { 
      title: 'Total Orders', 
      value: overview.totalOrders?.toLocaleString() || 0, 
      change: `${overview.ordersChange >= 0 ? '+' : ''}${overview.ordersChange}%`, 
      icon: ShoppingCart, 
      color: 'from-blue-500 to-indigo-600', 
      positive: overview.ordersChange >= 0 
    },
    { 
      title: 'Total Users', 
      value: overview.totalUsers?.toLocaleString() || 0, 
      change: `${overview.usersChange >= 0 ? '+' : ''}${overview.usersChange}%`, 
      icon: Users, 
      color: 'from-amber-500 to-pamber600', 
      positive: overview.usersChange >= 0 
    },
    { 
      title: 'Conversion Rate', 
      value: `${overview.conversionRate}%`, 
      change: '+0.5%', 
      icon: Target, 
      color: 'from-orange-500 to-red-600', 
      positive: true 
    },
    { 
      title: 'Avg Order Value', 
      value: `$${overview.avgOrderValue?.toFixed(2) || 0}`, 
      change: '+3.2%', 
      icon: Receipt, 
      color: 'from-teal-500 to-yellow-600', 
      positive: true 
    },
    { 
      title: 'Retention Rate', 
      value: `${overview.customerRetention}%`, 
      change: '+1.5%', 
      icon: Heart, 
      color: 'from-yellow-500 to-amber-600', 
      positive: true 
    },
  ];

  // Secondary stats
  const secondaryStats = [
    { title: 'Products', value: overview.totalProducts || 0, icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Site Reviews', value: overview.totalSiteReviews || 0, icon: Star, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { title: 'Hero Banners', value: overview.totalHeroes || 0, icon: Image, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    { title: 'Coupons', value: overview.totalCoupons || 0, icon: Tag, color: 'text-green-600', bgColor: 'bg-green-100' },
  ];

  // Loading skeleton component
  const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 w-8 h-8"></div>
        <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="mt-3 w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="mt-1 w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  );

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30">
          <Activity className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <button
          onClick={refreshData}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 tambprle-600 text-white text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range.id
                    ? 'bg-gradient-to-r from-yellow-500 tambprle-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {range.shortLabel}
              </button>
            ))}
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className={`p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 tambprle-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Secondary Stats Row */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1">
                  <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                  <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {secondaryStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          kpiCards.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${kpi.color}`}>
                  <kpi.icon className="w-4 h-4 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${kpi.positive ? 'text-green-500' : 'text-red-500'}`}>
                  {kpi.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3">{kpi.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.title}</p>
            </motion.div>
          ))
        )}
      </div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sales & Orders Analysis</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? 'Loading data...' : `Revenue and order trends for ${timeRanges.find(r => r.id === timeRange)?.label}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[
              { id: 'composed', icon: Activity, label: 'Composed' },
              { id: 'area', icon: Activity, label: 'Area' },
              { id: 'bar', icon: BarChart2, label: 'Bar' },
              { id: 'line', icon: Activity, label: 'Line' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setChartType(type.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  chartType === type.id
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <type.icon className="w-4 h-4" />
                {type.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
          </div>
        ) : salesData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-gray-500">
            No sales data available for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={salesData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis yAxisId="left" stroke="#9ca3af" />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [name === 'sales' ? `$${value.toLocaleString()}` : value, name === 'sales' ? 'Sales' : 'Orders']}
              />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="sales" stroke="#f59e0b" fillOpacity={1} fill="url(#salesGradient)" strokeWidth={2} name="Sales ($)" />
              <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#d97706" fillOpacity={1} fill="url(#ordersGradient)" strokeWidth={2} name="Orders" />
              <Brush dataKey="name" height={30} stroke="#f59e0b" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sales by Category</h3>
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : `Revenue distribution across categories`}
              </p>
            </div>
            <PieChartIcon className="w-5 h-5 text-gray-400" />
          </div>
          {loading ? (
            <div className="h-[250px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : categoryData.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              No category data available
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${value} orders ($${props.payload.sales?.toLocaleString() || 0})`, props.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">${cat.sales?.toLocaleString() || 0}</p>
                      <p className="text-xs text-gray-500">{cat.value} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Customer Segments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Statistics</h3>
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${userStats.totalUsers?.toLocaleString() || 0} total users`}
              </p>
            </div>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          {loading ? (
            <div className="h-[250px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{userStats.totalUsers?.toLocaleString() || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{userStats.activeUsers?.toLocaleString() || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active (30d)</p>
                </div>
              </div>
              {userStats.roleDistribution?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role Distribution</p>
                  <div className="space-y-2">
                    {userStats.roleDistribution.map((role) => (
                      <div key={role._id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{role._id}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{role.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Order Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Status</h3>
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : 'Current order pipeline'}
              </p>
            </div>
            <ShoppingCart className="w-5 h-5 text-gray-400" />
          </div>
          {loading ? (
            <div className="h-[250px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {overview.orderStatusBreakdown?.map((status) => (
                <div key={status._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className={`w-3 h-3 rounded-full ${
                    status._id === 'Delivered' ? 'bg-green-500' :
                    status._id === 'Processing' ? 'bg-blue-500' :
                    status._id === 'Pending' ? 'bg-yellow-500' :
                    status._id === 'Cancelled' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{status._id}</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{status.count}</p>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-8">No order status data</div>
              )}
            </div>
          )}
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h3>
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : 'Key business indicators'}
              </p>
            </div>
            <BarChart2 className="w-5 h-5 text-gray-400" />
          </div>
          {loading ? (
            <div className="h-[250px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Order Value</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">${overview.avgOrderValue?.toFixed(2) || 0}</p>
                  </div>
                  <Receipt className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{overview.conversionRate}%</p>
                  </div>
                  <Target className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Retention Rate</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{overview.customerRetention}%</p>
                  </div>
                  <Heart className="w-8 h-8 text-amber-500" />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Growth Trends</h3>
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : 'Period over period comparison'}
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          {loading ? (
            <div className="h-[250px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Change</p>
                  <p className={`text-xl font-bold ${overview.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {overview.revenueChange >= 0 ? '+' : ''}{overview.revenueChange}%
                  </p>
                </div>
                {overview.revenueChange >= 0 ? <ArrowUpRight className="w-6 h-6 text-green-500" /> : <ArrowDownRight className="w-6 h-6 text-red-500" />}
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Orders Change</p>
                  <p className={`text-xl font-bold ${overview.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {overview.ordersChange >= 0 ? '+' : ''}{overview.ordersChange}%
                  </p>
                </div>
                {overview.ordersChange >= 0 ? <ArrowUpRight className="w-6 h-6 text-green-500" /> : <ArrowDownRight className="w-6 h-6 text-red-500" />}
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Users Change</p>
                  <p className={`text-xl font-bold ${overview.usersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {overview.usersChange >= 0 ? '+' : ''}{overview.usersChange}%
                  </p>
                </div>
                {overview.usersChange >= 0 ? <ArrowUpRight className="w-6 h-6 text-green-500" /> : <ArrowDownRight className="w-6 h-6 text-red-500" />}
              </div>
            </div>
          )}
        </motion.div>

        {/* Period Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Selected Period</h3>
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : 'Current analysis timeframe'}
              </p>
            </div>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">Time Range</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{timeRanges.find(r => r.id === timeRange)?.label}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">Data Source</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">Real-time API</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Revenue Summary & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Summary</h3>
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : 'Financial overview'}
              </p>
            </div>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          {loading ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">${overview.totalRevenue?.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Revenue</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{overview.totalOrders?.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Orders</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl text-center">
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{overview.totalUsers?.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Users</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl text-center">
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">${overview.avgOrderValue?.toFixed(2) || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg Order</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Top Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Categories</h3>
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : 'Best performing categories'}
              </p>
            </div>
            <PieChartIcon className="w-5 h-5 text-gray-400" />
          </div>
          {loading ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : categoryData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-gray-500">
              No category data
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {categoryData.slice(0, 5).map((cat, index) => (
                <div key={cat.name} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: cat.color }}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</p>
                    <p className="text-xs text-gray-500">{cat.value} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">${cat.sales?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-500">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Products</h3>
            <p className="text-sm text-gray-500">
              {loading ? 'Loading...' : `Best sellers for ${timeRanges.find(r => r.id === timeRange)?.label}`}
            </p>
          </div>
          <Link to="/admin/products" className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
            View All Products →
          </Link>
        </div>
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          </div>
        ) : topProducts.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            No product sales data available for this period
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Sales</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {topProducts.map((product, index) => (
                  <tr key={product.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 tambeple-600 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{product.sales} units</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">${product.revenue?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3">
                      <div className="w-24 h-8">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[
                            { value: product.sales * 0.6 },
                            { value: product.sales * 0.8 },
                            { value: product.sales * 0.7 },
                            { value: product.sales * 0.9 },
                            { value: product.sales },
                          ]}>
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#10b981" 
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Daily Revenue Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Revenue Trend</h3>
            <p className="text-sm text-gray-500">
              {loading ? 'Loading...' : 'Revenue and orders per day'}
            </p>
          </div>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        {loading ? (
          <div className="h-[250px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          </div>
        ) : overview.dailyRevenue?.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-gray-500">
            No daily revenue data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={overview.dailyRevenue || []}>
              <defs>
                <linearGradient id="dailyRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="_id" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [name === 'revenue' ? `$${value.toLocaleString()}` : value, name === 'revenue' ? 'Revenue' : 'Orders']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#dailyRevenueGradient)" strokeWidth={2} name="Revenue ($)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Payment Methods & Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Methods</h3>
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : 'Revenue by payment type'}
              </p>
            </div>
            <CreditCard className="w-5 h-5 text-gray-400" />
          </div>
          {loading ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : overview.revenueByPayment?.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-gray-500">
              No payment data available
            </div>
          ) : (
            <div className="space-y-4">
              {overview.revenueByPayment?.map((payment, index) => {
                const colors = ['from-blue-500 to-yellow-600', 'froambeple-500 toamberk-600', 'from-orange-500 to-red-600', 'from-green-500 to-emerald-600'];
                const bgColors = ['bg-blue-100 text-blue-600', 'bg-amber-100 text-amber-600', 'bg-orange-100 text-orange-600', 'bg-green-100 text-green-600'];
                return (
                  <div key={payment._id || index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${colors[index % colors.length]}`}>
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{payment._id || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{payment.count} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">${payment.total?.toLocaleString() || 0}</p>
                      <p className={`text-xs px-2 py-1 rounded-full ${bgColors[index % bgColors.length]}`}>
                        {((payment.total / overview.totalRevenue) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Order Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Status Breakdown</h3>
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : 'Current order distribution'}
              </p>
            </div>
            <ShoppingCart className="w-5 h-5 text-gray-400" />
          </div>
          {loading ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {overview.orderStatusBreakdown?.map((status, index) => {
                const statusColors = {
                  'Delivered': { bg: 'bg-green-100', text: 'text-green-600', bar: 'bg-green-500' },
                  'Processing': { bg: 'bg-blue-100', text: 'text-blue-600', bar: 'bg-blue-500' },
                  'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-600', bar: 'bg-yellow-500' },
                  'Cancelled': { bg: 'bg-red-100', text: 'text-red-600', bar: 'bg-red-500' },
                  'Shipped': { bg: 'bg-amber-100', text: 'text-amber-600', bar: 'bg-amber-500' },
                };
                const colors = statusColors[status._id] || { bg: 'bg-gray-100', text: 'text-gray-600', bar: 'bg-gray-500' };
                const totalOrders = overview.orderStatusBreakdown.reduce((sum, s) => sum + s.count, 0);
                const percentage = totalOrders > 0 ? ((status.count / totalOrders) * 100).toFixed(1) : 0;
                
                return (
                  <div key={status._id || index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                        {status._id}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{status.count} orders</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-right">{percentage}%</p>
                  </div>
                );
              }) || (
                <div className="text-center text-gray-500 py-8">No order status data</div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
