const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customer: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  place: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  cakeMessage: {
    type: String,
    default: ''
  },
  cakeTheme: {
    type: String,
    default: ''
  },
  cakeColours: {
    type: String,
    default: ''
  },
  deliveryDate: {
    type: String,
    required: true
  },
  deliveryTime: {
    type: String,
    required: true
  },
  rushFee: {
    type: Number,
    default: 0
  },
  items: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  payment: {
    type: String,
    default: 'Pay on Delivery'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  ref: {
    type: String,
    required: true
  },
  mpesaCheckoutId: {
    type: String,
    default: ''
  },
  mpesaReceipt: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;