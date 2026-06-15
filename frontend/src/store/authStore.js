import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.post('/api/auth/login', credentials);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      set({
        user: data,
        token: data.token,
        isAuthenticated: true,
        loading: false
      });
      return data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || 'Login failed'
      });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.post('/api/auth/register', userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      set({
        user: data,
        token: data.token,
        isAuthenticated: true,
        loading: false
      });
      return data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || 'Registration failed'
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false
    });
  },

  updateProfile: async (profileData) => {
    try {
      const { data } = await axios.put('/api/auth/profile', profileData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      set({ user: data });
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error;
    }
  }
}));

export default useAuthStore;