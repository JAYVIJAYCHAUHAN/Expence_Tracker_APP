const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true,
    min: 2000
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  categories: {
    type: Map,
    of: Number,
    default: new Map()
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Ensure unique budget per user/month/year combination
budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget; 