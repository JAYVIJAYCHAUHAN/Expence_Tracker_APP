const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middleware/auth');
const sessionManager = require('../middleware/sessionManager');

// Public routes
router.post('/register', userController.register);
router.post('/login', sessionManager, userController.login);

// Protected routes
router.post('/logout', authenticate, userController.logout);
router.get('/profile', authenticate, userController.getProfile);

module.exports = router; 