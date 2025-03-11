import { Request, Response, NextFunction } from 'express';

const MAX_EXPENSES = 20; // Maximum number of expenses demo user can create
const MAX_AMOUNT = 1000; // Maximum amount for a single expense

export const demoRestrictions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only apply restrictions to demo user
    if (req.user?.email === 'demo@example.com') {
      const method = req.method;
      const path = req.path;

      // Prevent demo user from modifying their profile
      if (path.includes('/api/users') && method !== 'GET') {
        return res.status(403).json({
          message: 'Demo user cannot modify profile. This is a demo account.',
          isDemo: true
        });
      }

      // For expense creation
      if (path.includes('/api/expenses') && method === 'POST') {
        const amount = parseFloat(req.body.amount);
        
        // Check amount limit
        if (amount > MAX_AMOUNT) {
          return res.status(403).json({
            message: `Demo user cannot create expenses over $${MAX_AMOUNT}`,
            isDemo: true
          });
        }

        // Check total expenses limit
        const totalExpenses = await req.app.locals.Expense.countDocuments({ 
          user: req.user._id 
        });
        
        if (totalExpenses >= MAX_EXPENSES) {
          return res.status(403).json({
            message: `Demo user is limited to ${MAX_EXPENSES} expenses. Please delete some expenses to add more.`,
            isDemo: true
          });
        }
      }

      // Add a demo flag to the response
      res.locals.isDemo = true;
    }

    next();
  } catch (error) {
    next(error);
  }
}; 