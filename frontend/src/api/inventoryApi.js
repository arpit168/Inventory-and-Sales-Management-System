import API from './axios';

export const inventoryApi = {
  getOverview: (params) => API.get('/inventory/overview', { params }),
  adjustStock: (data) => API.post('/inventory/adjust', data),
  getHistory: (productId, params) => API.get(`/inventory/history/${productId}`, { params }),
  getLowStock: () => API.get('/inventory/low-stock'),
  getOutOfStock: () => API.get('/inventory/out-of-stock'),
};