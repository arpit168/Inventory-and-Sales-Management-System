import axios from 'axios';
import useAuthStore from '../store/authStore';

// Create axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for adding auth token
API.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Prevent infinite loops
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        // Clear auth state and redirect to login
        useAuthStore.getState().logout();
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access denied. Insufficient permissions.');
    }
    
    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      console.error('Too many requests. Please slow down.');
    }
    
    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('Server error. Please try again later.');
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default API;