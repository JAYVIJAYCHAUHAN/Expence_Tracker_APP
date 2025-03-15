const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const demoRestrictions = require('../middleware/demoRestrictions');
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpensesByDateRange,
  getExpensesByCategory
} = require('../controllers/expense.controller');

// All routes require authentication
router.use(authenticate);
router.use(demoRestrictions);

// Get all expenses for the logged-in user
router.get('/', getExpenses);

// Get expenses by date range
router.get('/by-date', getExpensesByDateRange);

// Get expenses by category
router.get('/by-category', getExpensesByCategory);

// Create a new expense
router.post('/', createExpense);

// Update an expense
router.patch('/:id', updateExpense);

// Delete an expense
router.delete('/:id', deleteExpense);

module.exports = router; 