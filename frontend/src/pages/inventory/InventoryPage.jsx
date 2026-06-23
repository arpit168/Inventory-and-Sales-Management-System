import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiAlertTriangle, FiAlertCircle, FiPlus, FiMinus } from 'react-icons/fi';
import { inventoryApi } from '../../api/inventoryApi';
import { useDebounce } from '../../hooks/useDebounce';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [stockStatus, setStockStatus] = useState('');
  const [adjustModal, setAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustment, setAdjustment] = useState({ quantity: 0, notes: '' });
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    fetchInventory();
  }, [debouncedSearch, page, stockStatus]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (stockStatus) params.stockStatus = stockStatus;

      const { data } = await inventoryApi.getOverview(params);
      setInventory(data.products);
      setStats(data.stats);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    try {
      await inventoryApi.adjustStock({
        productId: selectedProduct._id,
        adjustment: parseInt(adjustment.quantity),
        notes: adjustment.notes
      });
      toast.success('Stock adjusted successfully');
      setAdjustModal(false);
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to adjust stock');
    }
  };

  const openAdjustModal = (product, type) => {
    setSelectedProduct(product);
    setAdjustment({ quantity: type === 'add' ? 1 : -1, notes: '' });
    setAdjustModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track and manage your product inventory</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 bg-blue-500 rounded-full opacity-10" />
            <div className="relative">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Products</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProducts || 0}</p>
              <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1" />
                Active inventory
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 bg-purple-500 rounded-full opacity-10" />
            <div className="relative">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Stock</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalStock || 0}</p>
              <div className="mt-2 flex items-center text-xs text-purple-600 dark:text-purple-400">
                <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-1" />
                Units available
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 bg-green-500 rounded-full opacity-10" />
            <div className="relative">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock Value</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">₹{(stats.totalValue || 0).toLocaleString()}</p>
              <div className="mt-2 flex items-center text-xs text-green-600 dark:text-green-400">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1" />
                Total valuation
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 bg-red-500 rounded-full opacity-10" />
            <div className="relative">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Low Stock Alerts</p>
              <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">{stats.lowStock || 0}</p>
              <div className="mt-2 flex items-center text-xs text-red-600 dark:text-red-400">
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse" />
                Needs attention
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="">All Stock</option>
              <option value="in_stock">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {inventory.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/products/${product._id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {product.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{product.sku}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          {product.category?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {product.quantity === 0 ? (
                            <div className="flex items-center space-x-2">
                              <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full" />
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                                {product.quantity} / {product.minStockLevel}
                              </span>
                            </div>
                          ) : product.quantity <= product.minStockLevel ? (
                            <div className="flex items-center space-x-2">
                              <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                                {product.quantity} / {product.minStockLevel}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full" />
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                                {product.quantity} / {product.minStockLevel}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            ₹{(product.quantity * product.sellingPrice).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {product.quantity} × ₹{product.sellingPrice?.toLocaleString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => openAdjustModal(product, 'add')}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Add stock"
                          >
                            <FiPlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openAdjustModal(product, 'remove')}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            disabled={product.quantity === 0}
                            title="Remove stock"
                          >
                            <FiMinus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}

        {/* Stock Adjustment Modal */}
        <Modal
          isOpen={adjustModal}
          onClose={() => setAdjustModal(false)}
          title={`Adjust Stock - ${selectedProduct?.name}`}
        >
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Stock</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedProduct?.quantity} units
                </span>
              </div>
            </div>

            <Input
              label="Adjustment Quantity"
              type="number"
              value={adjustment.quantity}
              onChange={(e) => setAdjustment({ ...adjustment, quantity: e.target.value })}
              helperText="Use positive to add, negative to remove"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={adjustment.notes}
                onChange={(e) => setAdjustment({ ...adjustment, notes: e.target.value })}
                rows={3}
                className="block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Reason for adjustment"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="outline" onClick={() => setAdjustModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdjustStock}>
                Adjust Stock
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default InventoryPage;