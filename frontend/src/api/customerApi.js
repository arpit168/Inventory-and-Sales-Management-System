import API from './axios';

export const customerApi = {
  // Get all customers with pagination and search
  getCustomers: (params = {}) => {
    return API.get('/customers', { params });
  },

  // Search customer by mobile number
  searchCustomer: (mobile) => {
    return API.get('/customers/search', { params: { mobile } });
  },

  // Get single customer by ID
  getCustomer: (id) => {
    return API.get(`/customers/${id}`);
  },

  // Create new customer
  createCustomer: (customerData) => {
    return API.post('/customers', customerData);
  },

  // Update existing customer
  updateCustomer: (id, customerData) => {
    return API.put(`/customers/${id}`, customerData);
  },

  // Delete customer
  deleteCustomer: (id) => {
    return API.delete(`/customers/${id}`);
  },

  // Get customer purchase history
  getCustomerPurchases: (id) => {
    return API.get(`/customers/${id}/purchases`);
  },

  // Get customer by mobile (for POS)
  getCustomerByMobile: async (mobile) => {
    try {
      const response = await API.get('/customers/search', { 
        params: { mobile } 
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // Customer not found
      }
      throw error;
    }
  },

  // Create customer if not exists (for POS)
  findOrCreate: async (customerData) => {
    try {
      // Try to find customer first
      const existing = await customerApi.getCustomerByMobile(customerData.mobile);
      if (existing) {
        return existing;
      }
      // Create new customer if not found
      const response = await API.post('/customers', customerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default customerApi;