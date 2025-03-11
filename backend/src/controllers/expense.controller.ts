import { Request, Response } from 'express';
import Expense from '../models/Expense';

export const createExpense = async (req: Request, res: Response) => {
  try {
    const expense = new Expense({
      ...req.body,
      userId: req.user._id // Will be set by auth middleware
    });
    
    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Error creating expense', error });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error });
  }
};

export const getExpenseById = async (req: Request, res: Response) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expense', error });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      req.body,
      { new: true }
    );
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error updating expense', error });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense', error });
  }
};

export const getMonthlyExpenses = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    
    const startDate = new Date(Number(year), Number(month), 1);
    const endDate = new Date(Number(year), Number(month) + 1, 0);
    
    const expenses = await Expense.find({
      userId: req.user._id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    res.json({
      expenses,
      total,
      month,
      year
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching monthly expenses', error });
  }
}; 