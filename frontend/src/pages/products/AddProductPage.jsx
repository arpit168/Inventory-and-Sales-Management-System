import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { useProducts } from '../../hooks/useProduct';
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../../api/categoryApi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const AddProductPage = () => {
  const navigate = useNavigate();
  const { createProduct } = useProducts();
  const [imagePreview, setImagePreview] = useState(null);

  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const { data } = await categoryApi.getAllCategories();

      if (Array.isArray(data)) return data;

      return data.categories || data.data || [];
    }
  });

  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : [];

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      quantity: 0,
      minStockLevel: 10,
      taxPercentage: 0,
    }
  });

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
      } else {
        formData.append(key, data[key]);
      }
    });

    try {
      await createProduct(formData);
      navigate('/products');
    } catch (error) {
      // Error handled in hook
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Product Name"
              {...register('name', { required: 'Product name is required' })}
              error={errors.name?.message}
              placeholder="Enter product name"
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
              placeholder="e.g., PROD-001"
            />

            <Input
              label="Barcode"
              {...register('barcode')}
              error={errors.barcode?.message}
              placeholder="Enter barcode (optional)"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select category</option>
                 <option value="category">Regular</option>
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
              placeholder="Enter brand name (optional)"
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
              placeholder="Enter product description (optional)"
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
              placeholder="0.00"
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
              placeholder="0.00"
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
              label="Initial Quantity"
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
                PNG, JPG or GIF. Max 5MB.
              </p>
            </div>
          </div>
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
            Create Product
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;