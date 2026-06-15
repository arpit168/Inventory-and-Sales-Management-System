import { useState, useEffect } from 'react';
import { FiPackage, FiGrid, FiDollarSign, FiTrendingUp, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import API from '../../api/axios';
import { useThemeStore } from '../../store/themeStore';

const DashboardPage = () => {
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const { theme } = useThemeStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        API.get('/reports/dashboard-stats'),
        API.get('/reports/sales-analytics?days=30')
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const KPICard = ({ title, value, icon: Icon, trend, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Products"
          value={stats.totalProducts}
          icon={FiPackage}
          color="bg-blue-500"
          trend={5.2}
        />
        <KPICard
          title="Total Categories"
          value={stats.totalCategories}
          icon={FiGrid}
          color="bg-green-500"
        />
        <KPICard
          title="Today's Revenue"
          value={`₹${stats.todayRevenue?.toLocaleString() || 0}`}
          icon={FiDollarSign}
          color="bg-yellow-500"
        />
        <KPICard
          title="Monthly Revenue"
          value={`₹${stats.monthlyRevenue?.toLocaleString() || 0}`}
          icon={FiTrendingUp}
          color="bg-purple-500"
          trend={12.5}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <KPICard
          title="Low Stock Products"
          value={stats.lowStockProducts}
          icon={FiAlertTriangle}
          color="bg-orange-500"
        />
        <KPICard
          title="Out of Stock Products"
          value={stats.outOfStockProducts}
          icon={FiAlertCircle}
          color="bg-red-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue" />
              <Line type="monotone" dataKey="sales" stroke="#10B981" name="Sales" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.categoryDistribution}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {analytics.categoryDistribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                <th className="pb-3">Product</th>
                <th className="pb-3">Quantity Sold</th>
                <th className="pb-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topProducts?.map((product) => (
                <tr key={product._id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="py-3 text-gray-900 dark:text-white">{product.name}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{product.totalQuantity}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">₹{product.totalRevenue?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;