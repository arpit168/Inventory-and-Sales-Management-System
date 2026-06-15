import API from './axios';

export const reportApi = {
  getDashboardStats: () => API.get('/reports/dashboard-stats'),
  getSalesAnalytics: (params) => API.get('/reports/sales-analytics', { params }),
  getInventoryReport: () => API.get('/reports/inventory-report'),
  exportSalesPDF: (params) => API.get('/reports/export/sales/pdf', { 
    params, 
    responseType: 'blob' 
  }),
  exportSalesExcel: (params) => API.get('/reports/export/sales/excel', { 
    params, 
    responseType: 'blob' 
  }),
  exportInventoryPDF: () => API.get('/reports/export/inventory/pdf', { 
    responseType: 'blob' 
  }),
  exportInventoryExcel: () => API.get('/reports/export/inventory/excel', { 
    responseType: 'blob' 
  }),
};