const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware.verifyToken);

// Feature settings
router.get('/features', settingsController.getFeatureSettings);
router.put('/features', settingsController.saveFeatureSettings);
router.put('/features/:feature', settingsController.toggleFeature);

// Notification settings
router.get('/notifications', settingsController.getNotificationSettings);
router.put('/notifications', settingsController.saveNotificationSettings);

// User progress
router.get('/progress', settingsController.getUserProgress);
router.put('/progress', settingsController.updateUserProgress);

// Cache management
router.post('/clear-cache', settingsController.clearUserCache);

module.exports = router; 