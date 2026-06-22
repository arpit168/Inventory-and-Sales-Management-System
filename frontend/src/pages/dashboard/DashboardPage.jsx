import { useState, useEffect } from "react";
import {
  FiPackage,
  FiGrid,
  FiDollarSign,
  FiTrendingUp,
  FiAlertTriangle,
  FiAlertCircle,
  FiArrowUp,
  FiArrowDown,
  FiRefreshCw,
  FiActivity,
  FiShoppingCart,
  FiBarChart2,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import API from "../../api/axios";
import { motion } from "framer-motion";

const DashboardPage = () => {
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState({
    salesData: [],
    paymentMethods: [],
    topProducts: [],
    categoryDistribution: [],
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, analyticsRes] = await Promise.all([
        API.get("/reports/dashboard-stats"),
        API.get("/reports/sales-analytics", {
          params: { days: 30 },
        }),
      ]);

      setStats(statsRes.data || {});
      setAnalytics({
        salesData: analyticsRes.data?.salesData || [],
        paymentMethods: analyticsRes.data?.paymentMethods || [],
        topProducts: analyticsRes.data?.topProducts || [],
        categoryDistribution: analyticsRes.data?.categoryDistribution || [],
      });
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Dashboard Error:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#22c55e", "#a855f7", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899"];
  
  const GRADIENT_COLORS = [
    "url(#gradientGreen)",
    "url(#gradientPurple)",
    "url(#gradientOrange)",
    "url(#gradientRed)",
    "url(#gradientBlue)",
    "url(#gradientPink)",
  ];

  const cards = [
    {
      title: "Total Products",
      value: stats.totalProducts || 0,
      icon: FiPackage,
      bg: "from-emerald-400 to-green-500",
      gradient: "from-emerald-400/20 to-green-500/20",
      iconBg: "bg-emerald-400/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      trend: "+5.2%",
      trendUp: true,
    },
    {
      title: "Categories",
      value: stats.totalCategories || 0,
      icon: FiGrid,
      bg: "from-violet-400 to-purple-500",
      gradient: "from-violet-400/20 to-purple-500/20",
      iconBg: "bg-violet-400/20",
      iconColor: "text-violet-600 dark:text-violet-400",
      trend: "+2.1%",
      trendUp: true,
    },
    {
      title: "Today's Revenue",
      value: `₹${stats.todayRevenue?.toLocaleString() || 0}`,
      icon: FiDollarSign,
      bg: "from-amber-400 to-orange-500",
      gradient: "from-amber-400/20 to-orange-500/20",
      iconBg: "bg-amber-400/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      trend: "+18.2%",
      trendUp: true,
    },
    {
      title: "Monthly Revenue",
      value: `₹${stats.monthlyRevenue?.toLocaleString() || 0}`,
      icon: FiTrendingUp,
      bg: "from-rose-400 to-pink-500",
      gradient: "from-rose-400/20 to-pink-500/20",
      iconBg: "bg-rose-400/20",
      iconColor: "text-rose-600 dark:text-rose-400",
      trend: "+12.5%",
      trendUp: true,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-5 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-12 w-36 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      {/* SVG Gradients for Charts */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="gradientGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="gradientPurple" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#a855f7" stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="gradientOrange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="gradientRed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="gradientBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="gradientPink" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ec4899" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#ec4899" stopOpacity={0.2} />
          </linearGradient>
        </defs>
      </svg>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-green-400 to-purple-500 rounded-2xl shadow-lg">
            <FiBarChart2 className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-purple-600 dark:from-green-400 dark:to-purple-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <FiActivity className="text-green-500" />
              Inventory & Sales Overview
              {lastUpdated && (
                <span className="text-xs ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                  Updated: {lastUpdated}
                </span>
              )}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-purple-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <FiRefreshCw className="animate-spin-slow" />
          Refresh Data
        </motion.button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              variants={itemVariants}
              whileHover={{ scale: 1.03, rotate: 0.5 }}
              className="relative group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 rounded-2xl blur-xl transition-all duration-500 -z-10" />
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${card.iconBg}`}>
                    <Icon className={card.iconColor} size={24} />
                  </div>
                  {card.trend && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      card.trendUp 
                        ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {card.trendUp ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                      {card.trend}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{card.title}</p>
                <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {card.value}
                </h2>
                <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${card.bg} opacity-50`} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Alerts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative flex items-center gap-4">
            <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
              <FiAlertTriangle className="text-amber-600 dark:text-amber-400" size={28} />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 text-lg">
                Low Stock Alert
              </h3>
              <p className="text-4xl font-bold mt-2 text-amber-600 dark:text-amber-400">
                {stats.lowStockProducts || 0}
              </p>
              <p className="text-sm text-amber-600/70 dark:text-amber-400/70 mt-1">
                Products need restocking
              </p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative flex items-center gap-4">
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-2xl">
              <FiAlertCircle className="text-red-600 dark:text-red-400" size={28} />
            </div>
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-300 text-lg">
                Out of Stock
              </h3>
              <p className="text-4xl font-bold mt-2 text-red-600 dark:text-red-400">
                {stats.outOfStockProducts || 0}
              </p>
              <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-1">
                Products unavailable
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 xl:grid-cols-2 gap-6"
      >
        {/* Sales Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <FiTrendingUp className="text-green-500" />
                Sales Trend
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Last 30 days performance
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                Revenue
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                Orders
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={analytics.salesData || []}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="_id" 
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={3}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 6, fill: "#22c55e" }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#a855f7"
                strokeWidth={3}
                fill="url(#ordersGradient)"
                dot={false}
                activeDot={{ r: 6, fill: "#a855f7" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div>
            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2 mb-1">
              <FiShoppingCart className="text-purple-500" />
              Category Distribution
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Product count by category
            </p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={analytics.categoryDistribution || []}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={130}
                innerRadius={60}
                paddingAngle={5}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {(analytics.categoryDistribution || []).map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Top Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
              🏆 Top Selling Products
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Best performing products this month
            </p>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-purple-50 dark:from-green-900/20 dark:to-purple-900/20 rounded-xl">
            <span className="text-sm font-semibold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
              Top Performers
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-100 dark:border-gray-700">
                <th className="text-left py-4 px-4 font-semibold text-gray-600 dark:text-gray-400">
                  # Product Name
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-600 dark:text-gray-400">
                  Quantity Sold
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-600 dark:text-gray-400">
                  Revenue Generated
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-600 dark:text-gray-400">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody>
              {(analytics.topProducts || []).map((product, index) => (
                <motion.tr
                  key={product._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-green-50/50 hover:to-purple-50/50 dark:hover:from-green-900/10 dark:hover:to-purple-900/10 transition-all duration-300"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                        index === 2 ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                        'bg-gradient-to-br from-gray-400 to-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium dark:text-white">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FiShoppingCart className="text-gray-400" size={16} />
                      <span className="font-semibold dark:text-white">{product.totalQuantity}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-green-600 dark:text-green-400">
                      ₹{product.totalRevenue?.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-purple-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (product.totalRevenue / (analytics.topProducts[0]?.totalRevenue || 1)) * 100)}%`
                        }}
                      />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {analytics.topProducts?.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">
                No Sales Data Yet
              </h3>
              <p className="text-gray-400 dark:text-gray-500">
                Start selling to see your top products here
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;