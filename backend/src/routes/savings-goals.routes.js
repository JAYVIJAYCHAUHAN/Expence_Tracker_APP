const express = require('express');
const router = express.Router();
const savingsGoalsController = require('../controllers/savings-goals.controller');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware.verifyToken);

// Get all savings goals
router.get('/', savingsGoalsController.getAllGoals);

// Create a new savings goal
router.post('/', savingsGoalsController.createGoal);

// Get a specific savings goal
router.get('/:id', savingsGoalsController.getGoalById);

// Update a savings goal
router.put('/:id', savingsGoalsController.updateGoal);

// Delete a savings goal
router.delete('/:id', savingsGoalsController.deleteGoal);

// Add a deposit to a savings goal
router.post('/:id/deposits', savingsGoalsController.addDeposit);

// Remove a deposit from a savings goal
router.delete('/:id/deposits/:depositId', savingsGoalsController.removeDeposit);

module.exports = router; 