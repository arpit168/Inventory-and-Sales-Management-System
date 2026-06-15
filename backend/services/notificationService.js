import Notification from '../models/Notification.js';

class NotificationService {
  async getNotifications(userId, queryParams) {
    const {
      page = 1,
      limit = 20,
      type,
      isRead
    } = queryParams;

    const skip = (page - 1) * limit;
    const query = { userId };

    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId, isRead: false })
    ]);

    return {
      notifications,
      unreadCount,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    };
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    return { message: 'All notifications marked as read' };
  }

  async createNotification(data) {
    return await Notification.create(data);
  }

  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  }

  async getUnreadCount(userId) {
    return await Notification.countDocuments({ userId, isRead: false });
  }
}

export default new NotificationService();