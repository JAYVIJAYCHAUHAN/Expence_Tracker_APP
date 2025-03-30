const SavingsGoal = require('../models/SavingsGoal');
const mongoose = require('mongoose');

/**
 * Get all savings goals for the current user
 */
const getAllGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    
    // Format the response to match frontend expectations
    const formattedGoals = goals.map(goal => ({
      id: goal._id.toString(),
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      icon: goal.icon,
      color: goal.color,
      startDate: goal.startDate,
      targetDate: goal.targetDate,
      category: goal.category,
      priority: goal.priority,
      isCompleted: goal.isCompleted,
      deposits: goal.deposits.map(deposit => ({
        id: deposit._id.toString(),
        amount: deposit.amount,
        date: deposit.date,
        notes: deposit.notes
      }))
    }));
    
    return res.status(200).json(formattedGoals);
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    return res.status(500).json({ message: 'Failed to fetch savings goals' });
  }
};

/**
 * Get a specific savings goal by ID
 */
const getGoalById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid goal ID format' });
    }
    
    const goal = await SavingsGoal.findOne({ 
      _id: id,
      userId: req.user.userId 
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }
    
    // Format the response
    const formattedGoal = {
      id: goal._id.toString(),
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      icon: goal.icon,
      color: goal.color,
      startDate: goal.startDate,
      targetDate: goal.targetDate,
      category: goal.category,
      priority: goal.priority,
      isCompleted: goal.isCompleted,
      deposits: goal.deposits.map(deposit => ({
        id: deposit._id.toString(),
        amount: deposit.amount,
        date: deposit.date,
        notes: deposit.notes
      }))
    };
    
    return res.status(200).json(formattedGoal);
  } catch (error) {
    console.error('Error fetching savings goal:', error);
    return res.status(500).json({ message: 'Failed to fetch savings goal' });
  }
};

/**
 * Create a new savings goal
 */
const createGoal = async (req, res) => {
  try {
    const { name, targetAmount, icon, color, targetDate, category, priority } = req.body;
    
    // Validate required fields
    if (!name || !targetAmount) {
      return res.status(400).json({ message: 'Name and target amount are required' });
    }
    
    // Create new savings goal
    const newGoal = new SavingsGoal({
      userId: req.user.userId,
      name,
      targetAmount,
      icon: icon || 'bi-piggy-bank',
      color: color || '#00c4cc',
      startDate: new Date(),
      targetDate: targetDate ? new Date(targetDate) : null,
      category,
      priority: priority || 'medium',
      currentAmount: 0,
      deposits: []
    });
    
    const savedGoal = await newGoal.save();
    
    // Format the response
    const formattedGoal = {
      id: savedGoal._id.toString(),
      name: savedGoal.name,
      targetAmount: savedGoal.targetAmount,
      currentAmount: savedGoal.currentAmount,
      icon: savedGoal.icon,
      color: savedGoal.color,
      startDate: savedGoal.startDate,
      targetDate: savedGoal.targetDate,
      category: savedGoal.category,
      priority: savedGoal.priority,
      isCompleted: savedGoal.isCompleted,
      deposits: []
    };
    
    return res.status(201).json(formattedGoal);
  } catch (error) {
    console.error('Error creating savings goal:', error);
    return res.status(500).json({ message: 'Failed to create savings goal' });
  }
};

/**
 * Update an existing savings goal
 */
const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, targetAmount, currentAmount, icon, color, targetDate, category, priority } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid goal ID format' });
    }
    
    // Check if goal exists and belongs to user
    const existingGoal = await SavingsGoal.findOne({ 
      _id: id,
      userId: req.user.userId 
    });
    
    if (!existingGoal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }
    
    // Update goal
    existingGoal.name = name || existingGoal.name;
    existingGoal.targetAmount = targetAmount || existingGoal.targetAmount;
    existingGoal.icon = icon || existingGoal.icon;
    existingGoal.color = color || existingGoal.color;
    existingGoal.targetDate = targetDate ? new Date(targetDate) : existingGoal.targetDate;
    existingGoal.category = category || existingGoal.category;
    existingGoal.priority = priority || existingGoal.priority;
    
    // Update current amount if provided and not relying on deposits calculation
    if (currentAmount !== undefined) {
      existingGoal.currentAmount = currentAmount;
    }
    
    // Check if goal is completed
    if (existingGoal.currentAmount >= existingGoal.targetAmount) {
      existingGoal.isCompleted = true;
    } else {
      existingGoal.isCompleted = false;
    }
    
    const updatedGoal = await existingGoal.save();
    
    // Format the response
    const formattedGoal = {
      id: updatedGoal._id.toString(),
      name: updatedGoal.name,
      targetAmount: updatedGoal.targetAmount,
      currentAmount: updatedGoal.currentAmount,
      icon: updatedGoal.icon,
      color: updatedGoal.color,
      startDate: updatedGoal.startDate,
      targetDate: updatedGoal.targetDate,
      category: updatedGoal.category,
      priority: updatedGoal.priority,
      isCompleted: updatedGoal.isCompleted,
      deposits: updatedGoal.deposits.map(deposit => ({
        id: deposit._id.toString(),
        amount: deposit.amount,
        date: deposit.date,
        notes: deposit.notes
      }))
    };
    
    return res.status(200).json(formattedGoal);
  } catch (error) {
    console.error('Error updating savings goal:', error);
    return res.status(500).json({ message: 'Failed to update savings goal' });
  }
};

/**
 * Delete a savings goal
 */
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid goal ID format' });
    }
    
    // Check if goal exists and belongs to user
    const existingGoal = await SavingsGoal.findOne({ 
      _id: id,
      userId: req.user.userId 
    });
    
    if (!existingGoal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }
    
    // Delete the goal
    await SavingsGoal.deleteOne({ _id: id });
    
    return res.status(200).json({ message: 'Savings goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    return res.status(500).json({ message: 'Failed to delete savings goal' });
  }
};

/**
 * Add a deposit to a savings goal
 */
const addDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, date, notes } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid goal ID format' });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid deposit amount is required' });
    }
    
    // Check if goal exists and belongs to user
    const goal = await SavingsGoal.findOne({ 
      _id: id,
      userId: req.user.userId 
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }
    
    // Create new deposit
    const newDeposit = {
      amount,
      date: date ? new Date(date) : new Date(),
      notes: notes || ''
    };
    
    // Add deposit to goal
    goal.deposits.push(newDeposit);
    
    // Update current amount
    goal.currentAmount += amount;
    
    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }
    
    const updatedGoal = await goal.save();
    
    // Get the newly added deposit
    const addedDeposit = updatedGoal.deposits[updatedGoal.deposits.length - 1];
    
    // Format the response
    const formattedDeposit = {
      id: addedDeposit._id.toString(),
      amount: addedDeposit.amount,
      date: addedDeposit.date,
      notes: addedDeposit.notes
    };
    
    return res.status(201).json({
      deposit: formattedDeposit,
      currentAmount: updatedGoal.currentAmount,
      isCompleted: updatedGoal.isCompleted
    });
  } catch (error) {
    console.error('Error adding deposit:', error);
    return res.status(500).json({ message: 'Failed to add deposit' });
  }
};

/**
 * Remove a deposit from a savings goal
 */
const removeDeposit = async (req, res) => {
  try {
    const { id, depositId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(depositId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    // Check if goal exists and belongs to user
    const goal = await SavingsGoal.findOne({ 
      _id: id,
      userId: req.user.userId 
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }
    
    // Find the deposit
    const depositIndex = goal.deposits.findIndex(d => d._id.toString() === depositId);
    
    if (depositIndex === -1) {
      return res.status(404).json({ message: 'Deposit not found' });
    }
    
    // Get deposit amount before removing
    const depositAmount = goal.deposits[depositIndex].amount;
    
    // Remove deposit
    goal.deposits.splice(depositIndex, 1);
    
    // Update current amount
    goal.currentAmount -= depositAmount;
    
    // Ensure current amount is not negative
    if (goal.currentAmount < 0) {
      goal.currentAmount = 0;
    }
    
    // Update completion status
    goal.isCompleted = goal.currentAmount >= goal.targetAmount;
    
    await goal.save();
    
    return res.status(200).json({
      message: 'Deposit removed successfully',
      currentAmount: goal.currentAmount,
      isCompleted: goal.isCompleted
    });
  } catch (error) {
    console.error('Error removing deposit:', error);
    return res.status(500).json({ message: 'Failed to remove deposit' });
  }
};

module.exports = {
  getAllGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  addDeposit,
  removeDeposit
}; 