const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Subscription plan schema
const PlanSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  interval: {
    type: String,
    required: true,
    enum: ['month', 'year'],
    default: 'month'
  },
  features: {
    type: [String],
    default: []
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  limits: {
    expenses: {
      type: Number,
      default: 50
    },
    categories: {
      type: Number,
      default: 10
    },
    reports: {
      type: Number,
      default: 3
    }
  }
}, { timestamps: true });

// User subscription schema
const SubscriptionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    required: true,
    default: 'free'
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'canceled', 'expired', 'trialing'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  currentPeriodStart: {
    type: Date,
    default: Date.now
  },
  currentPeriodEnd: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  paymentMethodId: {
    type: String
  },
  usageData: {
    expenses: {
      used: {
        type: Number,
        default: 0
      },
      limit: {
        type: Number,
        default: 50
      },
      resetDate: {
        type: Date,
        default: () => {
          const now = new Date();
          return new Date(now.getFullYear(), now.getMonth() + 1, 1);
        }
      }
    }
  }
}, { timestamps: true });

// Virtual to get days remaining in subscription
SubscriptionSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const end = this.currentPeriodEnd;
  const diffTime = Math.abs(end - now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

const Plan = mongoose.model('Plan', PlanSchema);
const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = {
  Plan,
  Subscription
}; 