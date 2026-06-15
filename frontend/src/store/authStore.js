import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API from '../api/axios';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const { data } = await API.post('/auth/login', credentials);
          
          set({
            user: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
          
          return data;
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({
            loading: false,
            error: message,
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const { data } = await API.post('/auth/register', userData);
          
          set({
            user: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
          
          return data;
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed';
          set({
            loading: false,
            error: message,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      },

      updateProfile: async (profileData) => {
        try {
          const { data } = await API.put('/auth/profile', profileData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          set({
            user: data.user,
            error: null,
          });
          
          return data;
        } catch (error) {
          throw error;
        }
      },

      setUser: (user) => set({ user }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;