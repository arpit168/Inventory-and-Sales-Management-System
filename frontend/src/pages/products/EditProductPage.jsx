import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { useProducts } from '../../hooks/useProducts';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { useQuery } from '@tanstack/react-query';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateProduct, deleteProduct } = useProducts();
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);

  const { data: categories } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const { data } = await categoryApi.getAllCategories();
      return data;
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await productApi.getProduct(id);
      setProduct(data);
      setImagePreview(data.image);
      
      // Reset form with product data
      reset({
        name: data.name,
        sku: data.sku,
        barcode: data.barcode || '',
        category: data.category?._id || data.category,
        brand: data.brand || '',
        description: data.description || '',
        purchasePrice: data.purchasePrice,
        sellingPrice: data.sellingPrice,
        taxPercentage: data.taxPercentage || 0,
        quantity: data.quantity,
        minStockLevel: data.minStockLevel,
      });
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data.image?.[0]) {
        formData.append('image', data.image[0]);
      } else if (data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    try {
      await updateProduct(id, formData);
      navigate('/products');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await deleteProduct(id);
      navigate('/products');
    } catch (error) {
      // Error handled in hook
    }
  };

  if (loading) return <Loading fullScreen message="Loading product..." />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/products')}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Product - {product?.name}
          </h1>
        </div>
        <Button
          variant="danger"
          onClick={handleDelete}
          icon={FiTrash2}
        >
          Delete Product
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Product Name"
              {...register('name', { required: 'Product name is required' })}
              error={errors.name?.message}
            />

            <Input
              label="SKU"
              {...register('sku', { 
                required: 'SKU is required',
                pattern: {
                  value: /^[A-Z0-9-]+$/,
                  message: 'SKU must contain only uppercase letters, numbers, and hyphens'
                }
              })}
              error={errors.sku?.message}
            />

            <Input
              label="Barcode"
              {...register('barcode')}
              error={errors.barcode?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select                {...register('category', { required: 'Category is required' })}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select category</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <Input
              label="Brand"
              {...register('brand')}
              error={errors.brand?.message}
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pricing & Stock</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Purchase Price"
              type="number"
              step="0.01"
              {...register('purchasePrice', { 
                required: 'Purchase price is required',
                min: { value: 0, message: 'Must be positive' }
              })}
              error={errors.purchasePrice?.message}
            />

            <Input
              label="Selling Price"
              type="number"
              step="0.01"
              {...register('sellingPrice', { 
                required: 'Selling price is required',
                min: { value: 0, message: 'Must be positive' }
              })}
              error={errors.sellingPrice?.message}
            />

            <Input
              label="Tax Percentage (%)"
              type="number"
              step="0.01"
              {...register('taxPercentage', {
                min: { value: 0, message: 'Minimum 0%' },
                max: { value: 100, message: 'Maximum 100%' }
              })}
              error={errors.taxPercentage?.message}
            />

            <Input
              label="Quantity"
              type="number"
              {...register('quantity', {
                min: { value: 0, message: 'Must be 0 or more' }
              })}
              error={errors.quantity?.message}
            />

            <Input
              label="Minimum Stock Level"
              type="number"
              {...register('minStockLevel', {
                min: { value: 0, message: 'Must be 0 or more' }
              })}
              error={errors.minStockLevel?.message}
              helperText="Alert when stock falls below this level"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Image</h2>
          
          <div className="flex items-center space-x-6">
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                {...register('image')}
                onChange={handleImageChange}
                className="block text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100
                  dark:file:bg-primary-900 dark:file:text-primary-300"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG or GIF. Max 5MB. Leave empty to keep current image.
              </p>
            </div>
          </div>
        </div>

        {/* Stock History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stock History</h2>
          <StockHistory productId={id} />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/products')}
          >
            Cancel
          </Button>
          <Button type="submit" icon={FiSave}>
            Update Product
          </Button>
        </div>
      </form>
    </div>
  );
};

const StockHistory = ({ productId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [productId]);

  const fetchHistory = async () => {
    try {
      const { data } = await productApi.getProductHistory(productId);
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch stock history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-4">Loading history...</div>;

  if (history.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 text-center py-4">No stock history available</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Action</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Quantity</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Previous</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">New</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Date</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">User</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {history.map((entry, index) => (
            <tr key={index}>
              <td className="px-4 py-2 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  entry.action === 'stock_added' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  entry.action === 'stock_removed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {entry.action.replace('_', ' ')}
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{entry.quantity}</td>
              <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{entry.previousQuantity}</td>
              <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{entry.newQuantity}</td>
              <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                {new Date(entry.timestamp).toLocaleString()}
              </td>
              <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                {entry.performedBy?.name || 'Unknown'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EditProductPage;