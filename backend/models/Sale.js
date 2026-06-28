import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  }
});

const paymentDetailsSchema = new mongoose.Schema({
  cash: {
    type: Number,
    default: 0
  },
  upi: {
    type: Number,
    default: 0
  },
  card: {
    type: Number,
    default: 0
  },
  cardLastFour: {
    type: String,
    trim: true
  },
  upiTransactionId: {
    type: String,
    trim: true
  }
}, { _id: false });

const saleSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    default: 'Walk-in Customer'
  },
  customerMobile: {
    type: String,
    trim: true,
    default: 'N/A'
  },
  items: {
    type: [saleItemSchema],
    required: [true, 'At least one item is required'],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Cart must contain at least one item'
    }
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  totalDiscount: {
    type: Number,
    default: 0,
    min: [0, 'Total discount cannot be negative']
  },
  totalTax: {
    type: Number,
    default: 0,
    min: [0, 'Total tax cannot be negative']
  },
  grandTotal: {
    type: Number,
    required: true,
    min: [0, 'Grand total cannot be negative']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['cash', 'upi', 'card', 'mixed'],
      message: '{VALUE} is not a valid payment method'
    }
  },
  paymentDetails: {
    type: paymentDetailsSchema,
    default: () => ({})
  },
  status: {
    type: String,
    enum: ['completed', 'cancelled', 'refunded'],
    default: 'completed'
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  cancelledAt: Date,
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes

saleSchema.index({ createdAt: -1 });
saleSchema.index({ 'items.product': 1 });
saleSchema.index({ soldBy: 1 });
saleSchema.index({ customer: 1 });
saleSchema.index({ status: 1 });
saleSchema.index({ paymentMethod: 1 });

// Compound indexes for common queries
saleSchema.index({ createdAt: -1, status: 1 });
saleSchema.index({ soldBy: 1, createdAt: -1 });

// Virtual for item count
saleSchema.virtual('itemCount').get(function() {
  return this.items ? this.items.length : 0;
});

// Virtual for total items quantity
saleSchema.virtual('totalItems').get(function() {
  return this.items ? this.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
});

// Pre-save middleware for calculations
saleSchema.pre('save', function(next) {
  // Ensure all totals are properly calculated
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  this.items.forEach(item => {
    subtotal += item.unitPrice * item.quantity;
    totalDiscount += item.discount || 0;
    totalTax += item.tax || 0;
  });

  this.subtotal = subtotal;
  this.totalDiscount = totalDiscount;
  this.totalTax = totalTax;
  this.grandTotal = subtotal - totalDiscount + totalTax;

  next();
});

// Static methods
saleSchema.statics.generateInvoiceNumber = async function() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Get the last invoice number for today
  const lastInvoice = await this.findOne({
    invoiceNumber: new RegExp(`^INV-${year}${month}${day}`)
  }).sort({ invoiceNumber: -1 });

  let sequence = '0001';
  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2] || '0');
    sequence = (lastSequence + 1).toString().padStart(4, '0');
  }

  return `INV-${year}${month}${day}-${sequence}`;
};

// Static method to get sales statistics
saleSchema.statics.getStatistics = async function(query = {}) {
  return await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$grandTotal' },
        totalDiscount: { $sum: '$totalDiscount' },
        totalTax: { $sum: '$totalTax' },
        averageOrderValue: { $avg: '$grandTotal' },
        count: { $sum: 1 },
        minOrder: { $min: '$grandTotal' },
        maxOrder: { $max: '$grandTotal' }
      }
    }
  ]);
};

// Instance method to cancel sale
saleSchema.methods.cancel = async function(userId, reason = '') {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  this.cancelledBy = userId;
  return await this.save();
};

// Instance method to refund sale
saleSchema.methods.refund = async function(userId, reason = '') {
  this.status = 'refunded';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  this.cancelledBy = userId;
  return await this.save();
};

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;