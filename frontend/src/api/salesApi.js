import API from './axios';

export const salesApi = {
  createSale: (saleData) => API.post('/sales', saleData),
  getSales: (params) => API.get('/sales', { params }),
  getSale: (id) => API.get(`/sales/${id}`),
  getInvoice: (id) => API.get(`/sales/${id}/invoice`),
};