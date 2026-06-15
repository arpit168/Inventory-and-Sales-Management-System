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
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Inventory Management</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Stock</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStock || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Stock Value</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{(stats.totalValue || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock Alerts</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.lowStock || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={stockStatus}
          onChange={(e) => setStockStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Stock</option>
          <option value="in_stock">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {inventory.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <Link to={`/products/${product._id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600">
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{product.sku}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{product.category?.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.quantity === 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        product.quantity <= product.minStockLevel ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {product.quantity} / {product.minStockLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      ₹{(product.quantity * product.sellingPrice).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openAdjustModal(product, 'add')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded dark:hover:bg-green-900/20"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openAdjustModal(product, 'remove')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-900/20"
                          disabled={product.quantity === 0}
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
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={adjustModal}
        onClose={() => setAdjustModal(false)}
        title={`Adjust Stock - ${selectedProduct?.name}`}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Current Stock: <span className="font-semibold">{selectedProduct?.quantity} units</span>
            </p>
          </div>
          <Input
            label="Adjustment Quantity"
            type="number"
            value={adjustment.quantity}
            onChange={(e) => setAdjustment({ ...adjustment, quantity: e.target.value })}
            helperText="Use positive to add, negative to remove"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={adjustment.notes}
              onChange={(e) => setAdjustment({ ...adjustment, notes: e.target.value })}
              rows={2}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Reason for adjustment"
            />
          </div>
          <div className="flex justify-end space-x-3">
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
  );
};

export default InventoryPage;