import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user_login',
      'user_logout',
      'product_created',
      'product_updated',
      'product_deleted',
      'category_created',
      'category_updated',
      'category_deleted',
      'customer_created',
      'customer_updated',
      'customer_deleted',
      'sale_created',
      'sale_cancelled',
      'stock_adjusted',
      'report_generated',
      'settings_updated'
    ]
  },
  entity: {
    type: String,
    enum: ['user', 'product', 'category', 'customer', 'sale', 'inventory', 'report', 'settings'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ entity: 1, entityId: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;