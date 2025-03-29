const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware.verifyToken);

// Get budget for specific month/year
router.get('/', budgetController.getBudget);

// Create or update budget for specific month/year
router.post('/', budgetController.saveBudget);

module.exports = router; 