const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

const savingsGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 1
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  icon: {
    type: String,
    default: 'bi-piggy-bank'
  },
  color: {
    type: String,
    default: '#00c4cc'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date
  },
  category: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  deposits: [depositSchema],
  isCompleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Calculate currentAmount from deposits
savingsGoalSchema.pre('save', function(next) {
  if (this.deposits && this.deposits.length > 0) {
    this.currentAmount = this.deposits.reduce((total, deposit) => total + deposit.amount, 0);
  }
  
  // Check if goal is completed
  if (this.currentAmount >= this.targetAmount) {
    this.isCompleted = true;
  }
  
  next();
});

const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);

module.exports = SavingsGoal; 