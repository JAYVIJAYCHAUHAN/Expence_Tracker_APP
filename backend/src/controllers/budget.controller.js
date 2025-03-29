const Budget = require('../models/Budget');
const mongoose = require('mongoose');

/**
 * Get budget for specific month/year
 */
const getBudget = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Default to current month/year if not provided
    const currentDate = new Date();
    const targetMonth = parseInt(month) || currentDate.getMonth() + 1;
    const targetYear = parseInt(year) || currentDate.getFullYear();
    
    // Validate month/year
    if (targetMonth < 1 || targetMonth > 12) {
      return res.status(400).json({ message: 'Invalid month. Should be 1-12.' });
    }
    
    if (targetYear < 2000) {
      return res.status(400).json({ message: 'Invalid year. Should be 2000 or later.' });
    }
    
    // Find budget for user/month/year
    const budget = await Budget.findOne({
      userId: req.user.userId,
      month: targetMonth,
      year: targetYear
    });
    
    // If no budget found, return default
    if (!budget) {
      return res.status(200).json({
        month: targetMonth,
        year: targetYear,
        amount: 50000, // Default budget amount
        categories: {}
      });
    }
    
    // Format categories from Map to object
    const categoriesObj = {};
    if (budget.categories) {
      budget.categories.forEach((value, key) => {
        categoriesObj[key] = value;
      });
    }
    
    // Return budget details
    return res.status(200).json({
      id: budget._id.toString(),
      month: budget.month,
      year: budget.year,
      amount: budget.amount,
      categories: categoriesObj,
      notes: budget.notes
    });
  } catch (error) {
    console.error('Error fetching budget:', error);
    return res.status(500).json({ message: 'Failed to fetch budget' });
  }
};

/**
 * Create or update budget for specific month/year
 */
const saveBudget = async (req, res) => {
  try {
    const { month, year, amount, categories, notes } = req.body;
    
    // Validate required fields
    if (!month || !year || amount === undefined) {
      return res.status(400).json({ message: 'Month, year, and amount are required' });
    }
    
    // Validate month/year
    if (month < 1 || month > 12) {
      return res.status(400).json({ message: 'Invalid month. Should be 1-12.' });
    }
    
    if (year < 2000) {
      return res.status(400).json({ message: 'Invalid year. Should be 2000 or later.' });
    }
    
    // Convert categories object to Map if provided
    let categoriesMap;
    if (categories) {
      categoriesMap = new Map(Object.entries(categories));
    }
    
    // Find existing budget for user/month/year
    let budget = await Budget.findOne({
      userId: req.user.userId,
      month,
      year
    });
    
    if (budget) {
      // Update existing budget
      budget.amount = amount;
      if (categoriesMap) budget.categories = categoriesMap;
      if (notes !== undefined) budget.notes = notes;
      
      await budget.save();
    } else {
      // Create new budget
      budget = new Budget({
        userId: req.user.userId,
        month,
        year,
        amount,
        categories: categoriesMap || new Map(),
        notes: notes || ''
      });
      
      await budget.save();
    }
    
    // Format categories from Map to object
    const categoriesObj = {};
    if (budget.categories) {
      budget.categories.forEach((value, key) => {
        categoriesObj[key] = value;
      });
    }
    
    // Return updated budget
    return res.status(200).json({
      id: budget._id.toString(),
      month: budget.month,
      year: budget.year,
      amount: budget.amount,
      categories: categoriesObj,
      notes: budget.notes
    });
  } catch (error) {
    console.error('Error saving budget:', error);
    return res.status(500).json({ message: 'Failed to save budget' });
  }
};

module.exports = {
  getBudget,
  saveBudget
}; 