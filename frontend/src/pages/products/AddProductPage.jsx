import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiSave, FiArrowLeft, FiUploadCloud, FiImage } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';

// Assuming these are properly exported from your file structure
import { useProducts } from '../../hooks/useProduct';
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

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const { register, handleSubmit, formState: { errors } } = useForm({
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <form onSubmit={handleSubmit(onSubmit)}>
        
        {/* Sticky Header with Actions */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Add New Product
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/products')}
                className="bg-white"
              >
                Discard
              </Button>
              <Button type="submit" icon={FiSave}>
                Save Product
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-6xl mx-auto px-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Main Information */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Basic Info Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">General Information</h2>
                <div className="space-y-6">
                  <Input
                    label="Product Name"
                    {...register('name', { required: 'Product name is required' })}
                    error={errors.name?.message}
                    placeholder="Short sleeve t-shirt"
                    className="w-full"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                      placeholder="Write a detailed description of the product..."
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Pricing</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    placeholder="e.g. 15"
                  />
                </div>
              </div>

              {/* Inventory & Tracking Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Inventory & Tracking</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="SKU (Stock Keeping Unit)"
                    {...register('sku', {
                      required: 'SKU is required',
                      pattern: {
                        value: /^[A-Z0-9-]+$/,
                        message: 'Only uppercase letters, numbers, and hyphens'
                      }
                    })}
                    error={errors.sku?.message}
                    placeholder="e.g., PROD-001"
                  />
                  <Input
                    label="Barcode (ISBN, UPC, GTIN)"
                    {...register('barcode')}
                    error={errors.barcode?.message}
                    placeholder="Enter barcode"
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
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Sidebar */}
            <div className="space-y-8">
              
              {/* Image Upload Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Media</h2>
                
                <div className="mt-2">
                  <label className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors overflow-hidden group">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium">Change Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 dark:text-gray-400">
                        <FiUploadCloud className="w-10 h-10 mb-3 text-primary-500" />
                        <p className="mb-2 text-sm font-semibold">Click to upload or drag and drop</p>
                        <p className="text-xs">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      {...register('image')}
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>

              {/* Organization Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Organization</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors cursor-pointer"
                    >
                      <option value="">Select category...</option>
                      {categories?.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-2 text-sm text-red-500">{errors.category.message}</p>
                    )}
                  </div>

                  <Input
                    label="Brand / Vendor"
                    {...register('brand')}
                    error={errors.brand?.message}
                    placeholder="e.g., Nike, Apple"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;