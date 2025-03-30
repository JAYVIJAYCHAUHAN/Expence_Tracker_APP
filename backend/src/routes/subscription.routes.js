const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const authMiddleware = require('../middleware/auth');

// Get all plans (public route)
router.get('/plans', subscriptionController.getPlans);

// Protected routes - require authentication
router.use(authMiddleware.verifyToken);

// Get current subscription
router.get('/current', subscriptionController.getCurrentSubscription);

// Subscribe to a plan
router.post('/subscribe', subscriptionController.subscribeToPlan);

// Cancel a subscription
router.post('/:subscriptionId/cancel', subscriptionController.cancelSubscription);

// Resume a canceled subscription
router.post('/:subscriptionId/resume', subscriptionController.resumeSubscription);

// Get usage and limits
router.get('/usage', subscriptionController.getUsageAndLimits);

module.exports = router; 