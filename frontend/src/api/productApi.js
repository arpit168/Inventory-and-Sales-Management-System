import API from './axios';

export const productApi = {
  getProducts: (params) => API.get('/products', { params }),
  getProduct: (id) => API.get(`/products/${id}`),
  createProduct: (productData) => API.post('/products', productData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProduct: (id, productData) => API.put(`/products/${id}`, productData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProduct: (id) => API.delete(`/products/${id}`),
  getProductHistory: (id) => API.get(`/products/${id}/history`),
};