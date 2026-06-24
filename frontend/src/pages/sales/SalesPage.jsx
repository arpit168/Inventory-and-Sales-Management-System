import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiDownload, 
  FiPieChart, 
  FiDollarSign, 
  FiFileText, 
  FiTrendingUp,
  FiFilter,
  FiCalendar
} from 'react-icons/fi';
import { salesApi } from '../../api/salesApi';
import { reportApi } from '../../api/reportApi';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    fetchSales();
  }, [page, startDate, endDate, paymentMethod]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (paymentMethod) params.paymentMethod = paymentMethod;

      const { data } = await salesApi.getSales(params);
      setSales(data.sales);
      setSummary(data.summary);
      setTotalPages(data.pages);
    } catch (error) {
      toast.error('Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await reportApi.exportSalesPDF(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await reportApi.exportSalesExcel(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel downloaded successfully');
    } catch (error) {
      toast.error('Failed to export Excel');
    }
  };

  const getPaymentBadgeStyle = (method) => {
    switch (method?.toLowerCase()) {
      case 'cash':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'upi':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'card':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Sales History</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your store's performance and transactions.</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleExportPDF} icon={FiDownload} className="bg-white">
              Export PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel} icon={FiDownload} className="bg-white">
              Export Excel
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <FiPieChart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.count || 0}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <FiDollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{(summary.totalSales || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
              <FiFileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tax</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{(summary.totalTax || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <FiTrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Order Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{summary.count ? (summary.totalSales / summary.count).toFixed(2) : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Filters Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mr-2">
              <FiFilter className="w-5 h-5" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <div className="relative flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-gray-400" />
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <span className="text-gray-400 hidden sm:block">to</span>
            
            <div className="relative flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-gray-400" />
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="w-full sm:w-auto sm:ml-auto">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all cursor-pointer"
              >
                <option value="">All Payment Methods</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        {loading ? (
          <div className="py-12">
            <Loading />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {sales.length > 0 ? (
                    sales.map((sale) => (
                      <tr key={sale._id} className="hover:bg-gray-50 dark:hover:bg-gray-750/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {sale.invoiceNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(sale.createdAt).toLocaleDateString(undefined, { 
                            year: 'numeric', month: 'short', day: 'numeric' 
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {sale.customerName || 'Walk-in Customer'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {sale.items?.length || 0} items
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            ₹{sale.grandTotal?.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${getPaymentBadgeStyle(sale.paymentMethod)}`}>
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/sales/${sale._id}/invoice`}
                            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                          >
                            View Invoice
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center">
                          <FiFileText className="w-10 h-10 mb-3 text-gray-300 dark:text-gray-600" />
                          <p className="text-lg font-medium text-gray-900 dark:text-white">No sales found</p>
                          <p className="text-sm mt-1">Try adjusting your filters or date range.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesPage;