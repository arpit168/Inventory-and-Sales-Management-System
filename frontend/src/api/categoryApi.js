import API from './axios';

export const categoryApi = {
  getCategories: (params) => API.get('/categories', { params }),
  getAllCategories: () => API.get('/categories/all'),
  getCategory: (id) => API.get(`/categories/${id}`),
  createCategory: (categoryData) => API.post('/categories', categoryData),
  updateCategory: (id, categoryData) => API.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => API.delete(`/categories/${id}`),
};