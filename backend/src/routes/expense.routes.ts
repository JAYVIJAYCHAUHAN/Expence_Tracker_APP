import { Router } from 'express';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getMonthlyExpenses
} from '../controllers/expense.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes are protected with authentication
router.use(authenticate);

// CRUD operations
router.post('/', createExpense);
router.get('/', getExpenses);
router.get('/monthly', getMonthlyExpenses);
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router; 