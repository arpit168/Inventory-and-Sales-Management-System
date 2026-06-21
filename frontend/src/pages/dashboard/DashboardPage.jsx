import { useState, useEffect } from "react";
import {
  FiPackage,
  FiGrid,
  FiDollarSign,
  FiTrendingUp,
  FiAlertTriangle,
  FiAlertCircle,
  FiArrowUp,
  FiRefreshCw,
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
} from "recharts";
import API from "../../api/axios";



const DashboardPage = () => {
  const [stats, setStats] = useState({});
const [analytics, setAnalytics] = useState({
  salesData: [],
  paymentMethods: [],
  topProducts: [],
  categoryDistribution: []
});

const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

 const fetchDashboardData = async () => {
  try {
    setLoading(true);

    console.log("Fetching dashboard data...");

    const [statsRes, analyticsRes] = await Promise.all([
      API.get("/reports/dashboard-stats"),
      API.get("/reports/sales-analytics", {
        params: { days: 30 }
      }),
    ]);

    console.log("Stats Response:", statsRes);
console.log("Stats Data:", statsRes.data);

console.log("Analytics Response:", analyticsRes);
console.log("Analytics Data:", analyticsRes.data);

    setStats(statsRes.data || {});

    setAnalytics({
      salesData: analyticsRes.data?.salesData || [],
      paymentMethods: analyticsRes.data?.paymentMethods || [],
      topProducts: analyticsRes.data?.topProducts || [],
      categoryDistribution:
        analyticsRes.data?.categoryDistribution || [],
    });

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

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
  ];

  const cards = [
    {
      title: "Total Products",
      value: stats.totalProducts || 0,
      icon: FiPackage,
      bg: "from-blue-500 to-blue-600",
      trend: "+5.2%",
    },
    {
      title: "Categories",
      value: stats.totalCategories || 0,
      icon: FiGrid,
      bg: "from-green-500 to-green-600",
    },
    {
      title: "Today's Revenue",
      value: `₹${stats.todayRevenue?.toLocaleString() || 0}`,
      icon: FiDollarSign,
      bg: "from-yellow-500 to-orange-500",
    },
    {
      title: "Monthly Revenue",
      value: `₹${stats.monthlyRevenue?.toLocaleString() || 0}`,
      icon: FiTrendingUp,
      bg: "from-purple-500 to-purple-600",
      trend: "+12.5%",
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Inventory & Sales Overview
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="mt-4 lg:mt-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className={`bg-gradient-to-r ${card.bg}
                text-white rounded-2xl p-6 shadow-lg
                hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-sm">{card.title}</p>

                  <h2 className="text-3xl font-bold mt-2">
                    {card.value}
                  </h2>

                  {card.trend && (
                    <div className="flex items-center gap-1 mt-3 text-sm">
                      <FiArrowUp />
                      {card.trend}
                    </div>
                  )}
                </div>

                <div className="bg-white/20 p-3 rounded-xl">
                  <Icon size={28} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <FiAlertTriangle
              className="text-orange-500"
              size={24}
            />
            <div>
              <h3 className="font-semibold text-orange-700 dark:text-orange-300">
                Low Stock Products
              </h3>
              <p className="text-3xl font-bold mt-2">
                {stats.lowStockProducts || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="text-red-500" size={24} />
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-300">
                Out Of Stock
              </h3>
              <p className="text-3xl font-bold mt-2">
                {stats.outOfStockProducts || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6 dark:text-white">
            Sales Trend
          </h2>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={analytics.salesData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="sales"
                stroke="#10B981"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6 dark:text-white">
            Category Distribution
          </h2>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={analytics.categoryDistribution || []}
                dataKey="count"
                nameKey="name"
                outerRadius={110}
                label
              >
                {(analytics.categoryDistribution || []).map(
                  (_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  )
                )}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold dark:text-white">
            Top Selling Products
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-4">Product</th>
                <th className="text-left py-4">Quantity Sold</th>
                <th className="text-left py-4">Revenue</th>
              </tr>
            </thead>

            <tbody>
              {(analytics.topProducts || []).map((product) => (
                <tr
                  key={product._id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                >
                  <td className="py-4 font-medium">
                    {product.name}
                  </td>

                  <td>{product.totalQuantity}</td>

                  <td className="text-green-600 font-semibold">
                    ₹{product.totalRevenue?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {analytics.topProducts?.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No sales data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;