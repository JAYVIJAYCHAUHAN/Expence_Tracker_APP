const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired'],
    default: 'active'
  },
  features: [{
    type: String,
    enum: [
      'advanced_analytics',
      'investment_tracking',
      'ai_insights',
      'unlimited_history',
      'priority_support',
      'family_sharing',
      'receipt_scanning',
      'custom_categories',
      'export_reports',
      'bill_reminders',
      'budget_alerts',
      'multi_currency'
    ]
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  paymentHistory: [{
    amount: Number,
    date: Date,
    status: {
      type: String,
      enum: ['success', 'failed', 'pending', 'refunded']
    },
    transactionId: String
  }],
  customSettings: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 }, { expireAfterSeconds: 0 });

// Methods to check subscription status and features
subscriptionSchema.methods.isFeatureAvailable = function(featureName) {
  return this.features.includes(featureName);
};

subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && this.endDate > new Date();
};

subscriptionSchema.methods.daysRemaining = function() {
  return Math.ceil((this.endDate - new Date()) / (1000 * 60 * 60 * 24));
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription; 