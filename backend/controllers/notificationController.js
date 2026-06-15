    import notificationService from '../services/notificationService.js';

export const getNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getNotifications(
      req.user._id,
      req.query
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user._id
    );
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);
    res.json({ unreadCount: count });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.id, req.user._id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};