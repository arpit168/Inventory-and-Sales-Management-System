import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { categoryApi } from '../../api/categoryApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await categoryApi.getCategories({ limit: 100 });
      setCategories(data.categories || data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    reset({ name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      description: category.description || ''
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory._id, data);
        toast.success('Category updated successfully');
      } else {
        await categoryApi.createCategory(data);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      await categoryApi.deleteCategory(id);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
        <Button onClick={openCreateModal} icon={FiPlus}>
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Create your first category to organize your products."
          action={openCreateModal}
          actionText="Create Category"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {category.description}
                    </p>
                  )}
                  {category.productCount !== undefined && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {category.productCount} products
                    </p>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900/20"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category._id, category.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Category Name"
            {...register('name', { required: 'Category name is required' })}
            error={errors.name?.message}
            placeholder="Enter category name"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter category description"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;