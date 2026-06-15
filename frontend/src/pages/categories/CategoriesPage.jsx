import { useState, useEffect, useCallback } from 'react';
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await categoryApi.getCategories({
        limit: 100,
      });

      setCategories(data.categories || data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);

    reset({
      name: '',
      description: '',
    });

    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);

    reset({
      name: category.name,
      description: category.description || '',
    });

    setShowModal(true);
  };

  const onSubmit = async (formData) => {
    try {
      if (editingCategory) {
        await categoryApi.updateCategory(
          editingCategory._id,
          formData
        );

        toast.success('Category updated successfully');
      } else {
        await categoryApi.createCategory(formData);

        toast.success('Category created successfully');
      }

      setShowModal(false);

      await fetchCategories();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Operation failed'
      );
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete category "${name}"?`
    );

    if (!confirmed) return;

    try {
      await categoryApi.deleteCategory(id);

      toast.success('Category deleted successfully');

      await fetchCategories();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          'Failed to delete category'
      );
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Categories
        </h1>

        <Button onClick={openCreateModal}>
          <FiPlus className="mr-2 h-4 w-4" />
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category._id}
              className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
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

                <div className="ml-4 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(category)}
                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(category._id, category.name)
                    }
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          editingCategory
            ? 'Edit Category'
            : 'Create Category'
        }
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <Input
            label="Category Name"
            placeholder="Enter category name"
            error={errors.name?.message}
            {...register('name', {
              required: 'Category name is required',
            })}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description (Optional)
            </label>

            <textarea
              rows={3}
              placeholder="Enter category description"
              {...register('description')}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
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