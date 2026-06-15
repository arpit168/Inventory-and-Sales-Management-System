import API from './axios';

export const notificationApi = {
  getNotifications: (params) => API.get('/notifications', { params }),
  getUnreadCount: () => API.get('/notifications/unread-count'),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
  deleteNotification: (id) => API.delete(`/notifications/${id}`),
};