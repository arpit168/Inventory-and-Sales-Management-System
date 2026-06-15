import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';
import { inventoryApi } from '../../api/inventoryApi';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const LowStockPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true);
      const { data } = await inventoryApi.getLowStock();
      setProducts(data.products || data);
    } catch (error) {
      toast.error('Failed to fetch low stock products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <FiAlertTriangle className="w-8 h-8 text-yellow-500 mr-3" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Low Stock Products</h1>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={FiAlertTriangle}
          title="No low stock products"
          description="All products are well stocked."
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-yellow-50 dark:bg-yellow-900/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase">Min Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-yellow-50 dark:hover:bg-yellow-900/10">
                    <td className="px-6 py-4">
                      <Link to={`/products/${product._id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600">
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{product.sku}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{product.category?.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{product.minStockLevel}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Reorder Needed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockPage;