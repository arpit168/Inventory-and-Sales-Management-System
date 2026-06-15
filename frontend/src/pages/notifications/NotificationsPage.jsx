import { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiTrash2, FiPackage, FiShoppingCart, FiAlertTriangle } from 'react-icons/fi';
import useNotificationStore from '../../store/notificationStore';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotificationStore();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'sale_completed': return FiShoppingCart;
      case 'product_added':
      case 'product_updated':
      case 'product_deleted': return FiPackage;
      case 'low_stock':
      case 'out_of_stock': return FiAlertTriangle;
      default: return FiBell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'sale_completed': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      case 'product_added': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'product_updated': return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20';
      case 'product_deleted': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'low_stock': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'out_of_stock': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    return n.type === filter;
  });

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        <Button variant="outline" onClick={handleMarkAllAsRead} icon={FiCheck}>
          Mark All as Read
        </Button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6">
        {['all', 'unread', 'low_stock', 'out_of_stock', 'sale_completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-sm rounded-full capitalize ${
              filter === f
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={FiBell}
          title="No notifications"
          description="You're all caught up!"
        />
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);

            return (
              <div
                key={notification._id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${
                  !notification.isRead ? 'border-l-4 border-primary-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className={`text-sm font-medium ${
                        !notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex space-x-3 mt-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;