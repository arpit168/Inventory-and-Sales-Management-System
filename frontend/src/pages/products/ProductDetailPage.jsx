import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiEdit2, FiArrowLeft, FiPackage, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import { productApi } from '../../api/productApi';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import KPICard from '../../components/dashboard/KPICard';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await productApi.getProduct(id);
      setProduct(data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;
  if (!product) return <div className="p-6 text-center">Product not found</div>;

  const stockStatus = product.quantity === 0 ? 'out' : 
                       product.quantity <= product.minStockLevel ? 'low' : 'normal';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/products')}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
        </div>
        <Link to={`/products/${product._id}/edit`}>
          <Button icon={FiEdit2}>Edit Product</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Image & Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            )}
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">SKU</span>
                <p className="text-gray-900 dark:text-white font-medium">{product.sku}</p>
              </div>
              {product.barcode && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Barcode</span>
                  <p className="text-gray-900 dark:text-white font-medium">{product.barcode}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Category</span>
                <p className="text-gray-900 dark:text-white font-medium">
                  {product.category?.name || 'N/A'}
                </p>
              </div>
              {product.brand && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Brand</span>
                  <p className="text-gray-900 dark:text-white font-medium">{product.brand}</p>
                </div>
              )}
              {product.description && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Description</span>
                  <p className="text-gray-900 dark:text-white">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="lg:col-span-2">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <KPICard
              title="Current Stock"
              value={`${product.quantity} units`}
              icon={FiPackage}
              color={stockStatus === 'out' ? 'red' : stockStatus === 'low' ? 'yellow' : 'green'}
            />
            <KPICard
              title="Selling Price"
              value={`₹${product.sellingPrice}`}
              icon={FiTrendingUp}
              color="green"
            />
            <KPICard
              title="Purchase Price"
              value={`₹${product.purchasePrice}`}
              icon={FiTrendingDown}
              color="blue"
            />
          </div>

          {/* Pricing Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pricing Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Purchase Price</span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{product.purchasePrice}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Selling Price</span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{product.sellingPrice}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Profit Margin</span>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  ₹{(product.sellingPrice - product.purchasePrice).toFixed(2)} ({((product.sellingPrice - product.purchasePrice) / product.purchasePrice * 100).toFixed(1)}%)
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Tax Percentage</span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{product.taxPercentage}%</p>
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stock Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Current Stock</span>
                <p className="text-lg font-semibold">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    stockStatus === 'out' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    stockStatus === 'low' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {product.quantity} units
                  </span>
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Minimum Stock Level</span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{product.minStockLevel} units</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Stock Value</span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  ₹{(product.quantity * product.sellingPrice).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                <p className="text-lg font-semibold capitalize">
                  {stockStatus === 'out' ? 'Out of Stock' : stockStatus === 'low' ? 'Low Stock' : 'In Stock'}
                </p>
              </div>
            </div>
          </div>

          {/* Stock History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Stock History</h2>
            {product.history && product.history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Action</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {product.history.slice(0, 5).map((entry, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.action === 'stock_added' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            entry.action === 'stock_removed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {entry.action.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{entry.quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(entry.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No stock history available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;