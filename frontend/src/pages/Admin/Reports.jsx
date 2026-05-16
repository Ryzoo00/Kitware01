import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText, Download, Calendar, Filter, Search, Printer, Share2,
  Plus, RefreshCw, CheckCircle, Clock, MoreHorizontal,
  Edit3, Trash2, Folder, Clock3
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState('7days');
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const tabs = [
    { id: 'sales', label: 'Sales Reports', icon: DollarSign },
    { id: 'orders', label: 'Order Reports', icon: ShoppingCart },
    { id: 'customers', label: 'Customer Reports', icon: Users },
    { id: 'products', label: 'Product Reports', icon: Package },
    { id: 'inventory', label: 'Inventory Reports', icon: Package },
    { id: 'financial', label: 'Financial Reports', icon: FileText },
  ];

  const dateRanges = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7days', label: 'Last 7 Days' },
    { id: '30days', label: 'Last 30 Days' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'thisQuarter', label: 'This Quarter' },
    { id: 'thisYear', label: 'This Year' },
    { id: 'custom', label: 'Custom Range' },
  ];

  const reportTypes = {
    sales: [
      { id: 'sales_summary', name: 'Sales Summary', description: 'Overview of all sales transactions', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'sales_by_product', name: 'Sales by Product', description: 'Detailed product sales breakdown', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'sales_by_category', name: 'Sales by Category', description: 'Category-wise sales analysis', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'sales_by_date', name: 'Sales by Date', description: 'Daily sales trend report', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'sales_by_customer', name: 'Sales by Customer', description: 'Customer purchase history', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'sales_forecast', name: 'Sales Forecast', description: 'Predictive sales analysis', format: ['PDF', 'Excel'] },
    ],
    orders: [
      { id: 'order_summary', name: 'Order Summary', description: 'Complete order overview', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'orders_by_status', name: 'Orders by Status', description: 'Order status distribution', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'pending_orders', name: 'Pending Orders', description: 'All pending orders list', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'completed_orders', name: 'Completed Orders', description: 'Delivered orders report', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'cancelled_orders', name: 'Cancelled Orders', description: 'Cancelled and refunded orders', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'order_trends', name: 'Order Trends', description: 'Order pattern analysis', format: ['PDF', 'Excel'] },
    ],
    customers: [
      { id: 'customer_list', name: 'Customer List', description: 'Complete customer database', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'new_customers', name: 'New Customers', description: 'Recently registered customers', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'active_customers', name: 'Active Customers', description: 'Customers with recent purchases', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'top_customers', name: 'Top Customers', description: 'Highest value customers', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'customer_retention', name: 'Customer Retention', description: 'Retention rate analysis', format: ['PDF', 'Excel'] },
      { id: 'customer_demographics', name: 'Demographics', description: 'Customer demographic data', format: ['PDF', 'Excel'] },
    ],
    products: [
      { id: 'product_catalog', name: 'Product Catalog', description: 'Complete product listing', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'bestsellers', name: 'Bestsellers', description: 'Top selling products', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'low_stock', name: 'Low Stock Alert', description: 'Products running low', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'out_of_stock', name: 'Out of Stock', description: 'Unavailable products', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'product_performance', name: 'Product Performance', description: 'Product analytics report', format: ['PDF', 'Excel'] },
      { id: 'price_analysis', name: 'Price Analysis', description: 'Pricing insights', format: ['PDF', 'Excel'] },
    ],
    inventory: [
      { id: 'stock_levels', name: 'Stock Levels', description: 'Current inventory status', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'inventory_valuation', name: 'Inventory Valuation', description: 'Stock value report', format: ['PDF', 'Excel'] },
      { id: 'stock_movements', name: 'Stock Movements', description: 'In/Out stock log', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'reorder_report', name: 'Reorder Report', description: 'Items needing reorder', format: ['PDF', 'Excel', 'CSV'] },
    ],
    financial: [
      { id: 'revenue_report', name: 'Revenue Report', description: 'Total revenue analysis', format: ['PDF', 'Excel'] },
      { id: 'profit_loss', name: 'Profit & Loss', description: 'P&L statement', format: ['PDF', 'Excel'] },
      { id: 'tax_report', name: 'Tax Report', description: 'Tax calculation summary', format: ['PDF', 'Excel'] },
      { id: 'payment_methods', name: 'Payment Methods', description: 'Payment type breakdown', format: ['PDF', 'Excel', 'CSV'] },
      { id: 'refunds', name: 'Refunds Report', description: 'All refunds and returns', format: ['PDF', 'Excel', 'CSV'] },
    ],
  };

  const recentReports = [
    { id: 1, name: 'Sales Summary - Nov 2024', type: 'sales', date: '2024-11-15', size: '2.4 MB', format: 'PDF', status: 'ready' },
    { id: 2, name: 'Customer List Export', type: 'customers', date: '2024-11-14', size: '1.8 MB', format: 'Excel', status: 'ready' },
    { id: 3, name: 'Low Stock Alert', type: 'inventory', date: '2024-11-14', size: '856 KB', format: 'PDF', status: 'ready' },
    { id: 4, name: 'Order Trends Q4', type: 'orders', date: '2024-11-13', size: '3.2 MB', format: 'Excel', status: 'processing' },
    { id: 5, name: 'Product Performance', type: 'products', date: '2024-11-12', size: '4.1 MB', format: 'PDF', status: 'ready' },
  ];

  const scheduledReports = [
    { id: 1, name: 'Daily Sales Summary', frequency: 'Daily', time: '08:00 AM', recipients: 'admin@luxeliving.com', status: 'active', lastRun: '2024-11-15' },
    { id: 2, name: 'Weekly Order Report', frequency: 'Weekly', time: 'Monday 09:00 AM', recipients: 'team@luxeliving.com', status: 'active', lastRun: '2024-11-11' },
    { id: 3, name: 'Monthly Financial Statement', frequency: 'Monthly', time: '1st 10:00 AM', recipients: 'finance@luxeliving.com', status: 'active', lastRun: '2024-11-01' },
    { id: 4, name: 'Inventory Alert', frequency: 'Daily', time: '06:00 AM', recipients: 'warehouse@luxeliving.com', status: 'paused', lastRun: '2024-11-14' },
  ];

  const generateReport = (reportId) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(`Generating report: ${reportId}`);
    }, 1500);
  };

  const downloadReport = (report, format) => {
    alert(`Downloading ${report.name} in ${format} format`);
  };

  const currentReports = reportTypes[activeTab] || [];
  const filteredReports = currentReports.filter(report =>
    report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Generate, schedule, and manage business reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 tambprle-600 text-white shadow-md hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Schedule Report</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm"
              >
                {dateRanges.map(range => (
                  <option key={range.id} value={range.id}>{range.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm">
                <option>All Status</option>
                <option>Active</option>
                <option>Paused</option>
                <option>Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</label>
              <select className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm">
                <option>All Formats</option>
                <option>PDF</option>
                <option>Excel</option>
                <option>CSV</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-yellow-500 tambprle-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.location.reload()}
          className="p-2.5 h-11 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Refresh page"
        >
          <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${
                activeTab === 'sales' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                activeTab === 'orders' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                activeTab === 'customers' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                activeTab === 'products' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                activeTab === 'inventory' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
              }`}>
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex gap-1">
                {report.format.map(fmt => (
                  <span key={fmt} className="px-2 py-0.5 bg-yellow-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-400">
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{report.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{report.description}</p>
            <button
              onClick={() => generateReport(report.id)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 tambeple-600 text-white font-medium hover:shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Generate Report
            </button>
          </motion.div>
        ))}
      </div>

      {/* Recent Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Reports</h3>
              <p className="text-sm text-gray-500">Previously generated reports</p>
            </div>
            <Link to="#" className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
              View All
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Report Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Size</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Format</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <FileText className="w-4 h-4 text-yellow-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{report.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{report.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{report.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{report.size}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-400">
                      {report.format}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      report.status === 'ready'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {report.status === 'ready' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {report.status === 'ready' ? 'Ready' : 'Processing'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => downloadReport(report, report.format)}
                        className="p-1.5 hover:bg-yellow-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1.5 hover:bg-yellow-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Print">
                        <Printer className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1.5 hover:bg-yellow-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Share">
                        <Share2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1.5 hover:bg-yellow-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="More">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Scheduled Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scheduled Reports</h3>
              <p className="text-sm text-gray-500">Auto-generated reports</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors">
              <Plus className="w-4 h-4" />
              Add Schedule
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Report</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Frequency</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Recipients</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Last Run</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {scheduledReports.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{schedule.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{schedule.frequency}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{schedule.time}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{schedule.recipients}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      schedule.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${schedule.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                      {schedule.status === 'active' ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{schedule.lastRun}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 hover:bg-yellow-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Edit">
                        <Edit3 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1.5 hover:bg-yellow-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title={schedule.status === 'active' ? 'Pause' : 'Resume'}>
                        {schedule.status === 'active' ? <Clock className="w-4 h-4 text-gray-400" /> : <CheckCircle className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Reports Generated', value: '1,284', change: '+12%', icon: FileText },
          { label: 'Scheduled Active', value: '24', change: '+3', icon: Calendar },
          { label: 'Storage Used', value: '45.2 GB', change: '+8%', icon: Folder },
          { label: 'Last Export', value: '2h ago', change: 'Today', icon: Clock3 },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <stat.icon className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
