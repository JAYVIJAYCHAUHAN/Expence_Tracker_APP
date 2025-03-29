const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'bi-trophy'
  },
  points: {
    type: Number,
    default: 10
  },
  earnedAt: {
    type: Date,
    default: Date.now
  }
});

const progressSchema = new mongoose.Schema({
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  streak: {
    type: Number,
    default: 0,
    min: 0
  },
  achievements: [achievementSchema],
  nextLevelPoints: {
    type: Number,
    default: 100
  }
});

const featureSettingsSchema = new mongoose.Schema({
  savingsGoals: {
    type: Boolean,
    default: false
  },
  budgetTips: {
    type: Boolean,
    default: false
  },
  dataExport: {
    type: Boolean,
    default: false
  },
  progressTracking: {
    type: Boolean,
    default: true
  }
});

const notificationSettingsSchema = new mongoose.Schema({
  budgetAlerts: {
    type: Boolean,
    default: true
  },
  achievementNotifications: {
    type: Boolean,
    default: true
  },
  featureTips: {
    type: Boolean,
    default: true
  }
});

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  features: {
    type: featureSettingsSchema,
    default: () => ({})
  },
  notifications: {
    type: notificationSettingsSchema,
    default: () => ({})
  },
  progress: {
    type: progressSchema,
    default: () => ({})
  },
  appearance: {
    compactView: {
      type: Boolean,
      default: false
    }
  }
}, { timestamps: true });

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

module.exports = UserSettings; 