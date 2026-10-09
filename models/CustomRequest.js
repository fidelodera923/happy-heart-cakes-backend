const mongoose = require('mongoose');

const customRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  occasion: {
    type: String,
    default: ''
  },
  dateNeeded: {
    type: String,
    default: ''
  },
  servings: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Quoted', 'Closed'],
    default: 'New'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CustomRequest', customRequestSchema);