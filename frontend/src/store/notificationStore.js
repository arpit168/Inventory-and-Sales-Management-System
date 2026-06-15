import { create } from 'zustand';
import { notificationApi } from '../api/notificationApi';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await notificationApi.getNotifications(params);
      set({ 
        notifications: data.notifications, 
        unreadCount: data.unreadCount,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch notifications',
        loading: false 
      });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await notificationApi.getUnreadCount();
      set({ unreadCount: data.unreadCount });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationApi.markAsRead(id);
      set(state => ({
        notifications: state.notifications.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  },

  deleteNotification: async (id) => {
    try {
      await notificationApi.deleteNotification(id);
      set(state => ({
        notifications: state.notifications.filter(n => n._id !== id),
        unreadCount: state.notifications.find(n => n._id === id && !n.isRead) 
          ? state.unreadCount - 1 
          : state.unreadCount
      }));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }
}));

export default useNotificationStore;