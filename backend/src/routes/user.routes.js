const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');
const sessionManager = require('../middleware/sessionManager');

// Public routes
router.post('/register', userController.register);
router.post('/login', sessionManager, userController.login);

// Protected routes
router.post('/logout', authMiddleware.verifyToken, userController.logout);
router.get('/profile', authMiddleware.verifyToken, userController.getProfile);
router.put('/profile', authMiddleware.verifyToken, userController.updateProfile);

module.exports = router; 