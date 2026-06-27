import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { categoryApi } from '../../api/categoryApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

// Strategic color system: 6 colors, each with semantic weight
// Used consistently across the app, not randomly cycled
const categoryColors = [
  { name: 'slate', bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-400', dark: 'dark:bg-slate-900 dark:border-slate-700' },
  { name: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', dark: 'dark:bg-blue-900 dark:border-blue-700' },
  { name: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', dark: 'dark:bg-emerald-900 dark:border-emerald-700' },
  { name: 'amber', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', dark: 'dark:bg-amber-900 dark:border-amber-700' },
  { name: 'rose', bg: 'bg-rose-50', border: 'border-rose-200', dot: 'bg-rose-500', dark: 'dark:bg-rose-900 dark:border-rose-700' },
  { name: 'indigo', bg: 'bg-indigo-50', border: 'border-indigo-200', dot: 'bg-indigo-500', dark: 'dark:bg-indigo-900 dark:border-indigo-700' },
];

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await categoryApi.getCategories({ limit: 100 });
      console.log(data);
      
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
    reset({ name: '', description: '' });
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
        await categoryApi.updateCategory(editingCategory._id, formData);
        toast.success('Category updated');
      } else {
        await categoryApi.createCategory(formData);
        toast.success('Category created');
      }
      setShowModal(false);
      await fetchCategories();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await categoryApi.deleteCategory(id);
      toast.success('Category deleted');
      await fetchCategories();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete category');
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Categories
        </h1>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          {categories.length} {categories.length === 1 ? 'category' : 'categories'} • Manage your inventory organization
        </p>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
          />
        </div>

        {/* Create Button */}
        <Button 
          onClick={openCreateModal} 
          className="w-full sm:w-auto shrink-0 rounded-lg px-5 py-2.5 font-semibold shadow-sm hover:shadow-md transition-shadow"
        >
          <FiPlus className="mr-2 h-4 w-4 inline" />
          New Category
        </Button>
      </div>

      {/* Content */}
      {filteredCategories.length === 0 ? (
        <EmptyState
          title={searchTerm ? 'No categories match' : 'No categories yet'}
          description={searchTerm ? 'Try a different search term' : 'Create your first category to organize your inventory.'}
          action={searchTerm ? undefined : openCreateModal}
          actionText={searchTerm ? undefined : 'Create Category'}
          icon={<div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category, index) => {
            const colorScheme = categoryColors[index % categoryColors.length];

            return (
              <div
                key={category._id}
                className={`group relative flex flex-col ${colorScheme.bg} ${colorScheme.dark} border ${colorScheme.border} rounded-xl transition-all duration-200 hover:shadow-md hover:border-opacity-100 overflow-hidden`}
              >
                {/* Color indicator bar */}
                <div className={`h-1 w-full ${colorScheme.dot}`} />

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Top: Name + Count */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1 line-clamp-1">
                      {category.name}
                    </h3>
                    <div className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                      <span className={`h-2 w-2 rounded-full ${colorScheme.dot}`} />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {category.productCount ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                    {category.description || '—'}
                  </p>
                </div>

                {/* Action Buttons - Always visible, not hidden */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(category)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                    title="Edit category"
                  >
                    <FiEdit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category._id, category.name)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm font-medium"
                    title="Delete category"
                  >
                    <FiTrash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          <Input
            label="Category Name"
            placeholder="e.g., Summer Collection"
            error={errors.name?.message}
            {...register('name', { 
              required: 'Category name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' }
            })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description
              <span className="font-normal text-gray-500 dark:text-gray-400 ml-1">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="What kind of items belong in this category?"
              {...register('description')}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" className="px-5 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md transition-shadow">
              {editingCategory ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;