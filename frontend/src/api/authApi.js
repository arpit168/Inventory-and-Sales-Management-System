import API from './axios';

export const authApi = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (profileData) => API.put('/auth/profile', profileData),
  changePassword: (passwords) => API.put('/auth/change-password', passwords),
};