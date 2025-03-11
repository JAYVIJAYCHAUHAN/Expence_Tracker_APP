const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

// Get current subscription
router.get('/current', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user.id,
      status: 'active'
    });
    
    if (!subscription) {
      return res.json({
        plan: 'free',
        features: [],
        status: 'inactive'
      });
    }
    
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Subscribe to a plan
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { plan, paymentDetails } = req.body;
    
    // Define plan features and duration
    const planFeatures = {
      basic: [
        'export_reports',
        'bill_reminders',
        'budget_alerts'
      ],
      premium: [
        'advanced_analytics',
        'investment_tracking',
        'export_reports',
        'bill_reminders',
        'budget_alerts',
        'multi_currency',
        'custom_categories'
      ],
      enterprise: [
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
    };

    // Calculate end date (30 days from now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Process payment (integrate with your payment gateway)
    // This is a placeholder for payment processing
    const paymentResult = {
      success: true,
      transactionId: 'test_' + Date.now()
    };

    if (!paymentResult.success) {
      return res.status(400).json({ message: 'Payment failed' });
    }

    // Create or update subscription
    let subscription = await Subscription.findOne({
      userId: req.user.id,
      status: 'active'
    });

    if (subscription) {
      subscription.plan = plan;
      subscription.features = planFeatures[plan];
      subscription.endDate = endDate;
      subscription.paymentHistory.push({
        amount: paymentDetails.amount,
        date: new Date(),
        status: 'success',
        transactionId: paymentResult.transactionId
      });
    } else {
      subscription = new Subscription({
        userId: req.user.id,
        plan,
        features: planFeatures[plan],
        endDate,
        paymentHistory: [{
          amount: paymentDetails.amount,
          date: new Date(),
          status: 'success',
          transactionId: paymentResult.transactionId
        }]
      });
    }

    await subscription.save();
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user.id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get subscription history
router.get('/history', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check feature availability
router.get('/feature/:featureName', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user.id,
      status: 'active'
    });

    const isAvailable = subscription?.isFeatureAvailable(req.params.featureName);
    res.json({ isAvailable });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 