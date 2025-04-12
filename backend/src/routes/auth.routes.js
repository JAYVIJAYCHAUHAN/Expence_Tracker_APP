const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authMiddleware.verifyToken, authController.logout);

// Protected routes
router.get('/validate', authMiddleware.verifyToken, authController.validateToken);

// Password reset routes
router.post('/request-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

module.exports = router; 