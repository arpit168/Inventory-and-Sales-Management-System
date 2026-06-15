import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  totalPurchases: {
    type: Number,
    default: 0
  },
  purchaseHistory: [{
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale'
    },
    date: Date,
    amount: Number
  }]
}, {
  timestamps: true
});

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;