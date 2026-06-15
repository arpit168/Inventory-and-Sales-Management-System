import { useState, useCallback } from 'react';
import { productApi } from '../api/productApi';
import toast from 'react-hot-toast';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 0,
    total: 0
  });

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await productApi.getProducts(params);
      setProducts(data.products);
      setPagination({
        page: data.page,
        pages: data.pages,
        total: data.total
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = async (productData) => {
    try {
      const { data } = await productApi.createProduct(productData);
      toast.success('Product created successfully');
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product');
      throw err;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const { data } = await productApi.updateProduct(id, productData);
      toast.success('Product updated successfully');
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productApi.deleteProduct(id);
      toast.success('Product deleted successfully');
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
};