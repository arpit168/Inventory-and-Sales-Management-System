import { useState, useEffect } from 'react';
import { FiDownload, FiTrendingUp, FiPackage, FiDollarSign } from 'react-icons/fi';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { reportApi } from '../../api/reportApi';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const ReportsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await reportApi.getSalesAnalytics({ days: dateRange });
      setAnalytics(data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportInventory = async (format) => {
    try {
      const response = format === 'pdf'
        ? await reportApi.exportInventoryPDF()
        : await reportApi.exportInventoryExcel();
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-report-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Inventory report downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export inventory report`);
    }
  };

  if (loading) return <Loading />;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleExportInventory('pdf')} icon={FiDownload}>
            Export Inventory PDF
          </Button>
          <Button variant="outline" onClick={() => handleExportInventory('excel')} icon={FiDownload}>
            Export Inventory Excel
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <FiTrendingUp className="inline mr-2" />
            Sales Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue" />
              <Line type="monotone" dataKey="sales" stroke="#10B981" name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <FiDollarSign className="inline mr-2" />
            Payment Methods
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics?.paymentMethods}
                dataKey="total"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {analytics?.paymentMethods?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <FiPackage className="inline mr-2" />
            Top Selling Products
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalRevenue" fill="#3B82F6" name="Revenue" />
              <Bar dataKey="totalQuantity" fill="#10B981" name="Quantity" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <FiPackage className="inline mr-2" />
            Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics?.categoryDistribution}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {analytics?.categoryDistribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Inventory Report</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Download complete inventory report with stock levels and values.
          </p>
          <div className="flex space-x-2">
            <Button onClick={() => handleExportInventory('pdf')} icon={FiDownload}>
              PDF
            </Button>
            <Button onClick={() => handleExportInventory('excel')} icon={FiDownload}>
              Excel
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Sales Report</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Download sales report for the selected date range.
          </p>
          <div className="flex space-x-2">
            <Button onClick={() => {
              const params = { startDate: new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString() };
              reportApi.exportSalesPDF(params);
            }} icon={FiDownload}>
              PDF
            </Button>
            <Button onClick={() => {
              const params = { startDate: new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString() };
              reportApi.exportSalesExcel(params);
            }} icon={FiDownload}>
              Excel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;