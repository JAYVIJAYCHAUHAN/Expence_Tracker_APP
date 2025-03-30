const { Plan, Subscription } = require('../models/subscription.model');
const User = require('../models/User');
const Expense = require('../models/Expense');
const { default: mongoose } = require('mongoose');

// Initialize default plans if they don't exist
const initializePlans = async () => {
  try {
    // Check if plans already exist
    const plansCount = await Plan.countDocuments();
    if (plansCount > 0) {
      return;
    }

    // Create default plans
    const defaultPlans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'month',
        features: [
          'Basic expense tracking',
          'Monthly reports',
          'Up to 50 expense entries/month',
          'Data export (CSV)'
        ],
        isPopular: false,
        limits: {
          expenses: 50,
          categories: 10,
          reports: 3
        }
      },
      {
        id: 'pro',
        name: 'Professional',
        price: 499,
        interval: 'month',
        features: [
          'Unlimited expense entries',
          'Advanced analytics',
          'Budget planning tools',
          'Category insights',
          'Email reports',
          'Priority support'
        ],
        isPopular: true,
        limits: {
          expenses: 1000,
          categories: 50,
          reports: 20
        }
      },
      {
        id: 'business',
        name: 'Business',
        price: 999,
        interval: 'month',
        features: [
          'All Professional features',
          'Multi-user accounts',
          'Team expense tracking',
          'Receipt scanning',
          'Custom categories',
          'API access',
          'Dedicated support'
        ],
        isPopular: false,
        limits: {
          expenses: -1, // Unlimited
          categories: -1, // Unlimited
          reports: -1 // Unlimited
        }
      }
    ];

    await Plan.insertMany(defaultPlans);
    console.log('Default subscription plans created');
  } catch (error) {
    console.error('Error initializing subscription plans:', error);
  }
};

// Initialize plans on server start
initializePlans();

// Get all subscription plans
const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().select('-__v -createdAt -updatedAt');
    
    // If user is authenticated, mark the current plan
    if (req.user && req.user.userId) {
      const userSubscription = await Subscription.findOne({ user: req.user.userId });
      
      if (userSubscription) {
        plans.forEach(plan => {
          plan._doc.isCurrent = plan.id === userSubscription.plan;
        });
      }
    }
    
    return res.status(200).json(plans);
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get current user's subscription
const getCurrentSubscription = async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ user: req.user.userId });
    
    // If user doesn't have a subscription, create a free one
    if (!subscription) {
      subscription = await Subscription.create({
        user: req.user.userId,
        plan: 'free',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }
    
    // Get plan details
    const plan = await Plan.findOne({ id: subscription.plan });
    
    const subscriptionData = {
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      daysRemaining: subscription.daysRemaining
    };
    
    return res.status(200).json(subscriptionData);
  } catch (error) {
    console.error('Error getting current subscription:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Subscribe to a plan
const subscribeToPlan = async (req, res) => {
  try {
    const { planId, paymentMethodId } = req.body;
    
    // Validate inputs
    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }
    
    // Check if plan exists
    const plan = await Plan.findOne({ id: planId });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Get current user subscription
    let subscription = await Subscription.findOne({ user: req.user.userId });
    
    // If no subscription exists, create one
    if (!subscription) {
      subscription = new Subscription({
        user: req.user.userId,
        plan: planId,
        status: 'active',
        paymentMethodId: paymentMethodId || null
      });
    } else {
      // Update existing subscription
      subscription.plan = planId;
      subscription.status = 'active';
      subscription.cancelAtPeriodEnd = false;
      subscription.currentPeriodStart = new Date();
      subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      subscription.paymentMethodId = paymentMethodId || subscription.paymentMethodId;
      
      // Reset usage if changing plans
      if (subscription.plan !== planId) {
        subscription.usageData = {
          expenses: {
            used: 0,
            limit: plan.limits.expenses,
            resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
          }
        };
      }
    }
    
    await subscription.save();
    
    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed to plan',
      plan: planId
    });
  } catch (error) {
    console.error('Error subscribing to plan:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Cancel a subscription
const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.userId });
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Mark subscription to cancel at period end
    subscription.cancelAtPeriodEnd = true;
    await subscription.save();
    
    return res.status(200).json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period'
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Resume a canceled subscription
const resumeSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.userId });
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // If subscription is already canceled (not just marked for cancellation)
    if (subscription.status === 'canceled') {
      return res.status(400).json({ error: 'Cannot resume a canceled subscription. Please subscribe to a new plan.' });
    }
    
    // Remove cancellation flag
    subscription.cancelAtPeriodEnd = false;
    await subscription.save();
    
    return res.status(200).json({
      success: true,
      message: 'Subscription resumed successfully'
    });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get subscription usage and limits
const getUsageAndLimits = async (req, res) => {
  try {
    // Get user's subscription
    let subscription = await Subscription.findOne({ user: req.user.userId });
    
    // If no subscription, create a free one
    if (!subscription) {
      subscription = await Subscription.create({
        user: req.user.userId,
        plan: 'free',
        status: 'active'
      });
    }
    
    // Get plan details for limits
    const plan = await Plan.findOne({ id: subscription.plan });
    if (!plan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }
    
    // Get current month's expenses count
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const expenseCount = await Expense.countDocuments({
      user: req.user.userId,
      date: {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth
      }
    });
    
    // Update usage data
    subscription.usageData.expenses.used = expenseCount;
    subscription.usageData.expenses.limit = plan.limits.expenses;
    subscription.usageData.expenses.resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    await subscription.save();
    
    // Determine feature access based on plan
    const features = {
      dataExport: true, // Available on all plans
      budgetPlanning: subscription.plan !== 'free',
      advancedAnalytics: subscription.plan !== 'free',
      receiptScanning: subscription.plan === 'business',
      emailReports: subscription.plan !== 'free',
      apiAccess: subscription.plan === 'business'
    };
    
    return res.status(200).json({
      expenses: {
        used: subscription.usageData.expenses.used,
        limit: subscription.usageData.expenses.limit,
        resetDate: subscription.usageData.expenses.resetDate
      },
      features
    });
  } catch (error) {
    console.error('Error getting subscription usage:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getPlans,
  getCurrentSubscription,
  subscribeToPlan,
  cancelSubscription,
  resumeSubscription,
  getUsageAndLimits
}; 