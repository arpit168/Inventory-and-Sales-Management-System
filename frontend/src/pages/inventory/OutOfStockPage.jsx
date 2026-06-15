import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle } from 'react-icons/fi';
import { inventoryApi } from '../../api/inventoryApi';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const OutOfStockPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutOfStockProducts();
  }, []);

  const fetchOutOfStockProducts = async () => {
    try {
      setLoading(true);
      const { data } = await inventoryApi.getOutOfStock();
      setProducts(data.products || data);
    } catch (error) {
      toast.error('Failed to fetch out of stock products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <FiAlertCircle className="w-8 h-8 text-red-500 mr-3" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Out of Stock Products</h1>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={FiAlertCircle}
          title="No out of stock products"
          description="All products are in stock."
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-50 dark:bg-red-900/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-600 dark:text-red-400 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-600 dark:text-red-400 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-600 dark:text-red-400 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-600 dark:text-red-400 uppercase">Selling Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-600 dark:text-red-400 uppercase">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-red-50 dark:hover:bg-red-900/10">
                    <td className="px-6 py-4">
                      <Link to={`/products/${product._id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600">
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{product.sku}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{product.category?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">₹{product.sellingPrice}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(product.updatedAt).toLocaleDateString()}
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

export default OutOfStockPage;  