const demoRestrictions = async (req, res, next) => {
  try {
    // Skip restrictions for authentication routes (login/register/etc)
    if (req.path.includes('/auth/')) {
      return next();
    }

    // Skip restrictions for non-demo users
    if (!req.user || req.user.email !== 'demo@example.com') {
      return next();
    }

    // Allow GET requests (read operations)
    if (req.method === 'GET') {
      return next();
    }

    // For demo user, prevent:
    // 1. Changing password
    // 2. Deleting account
    // 3. Creating more than 10 expenses
    // 4. Modifying demo data

    // Check for password change attempts
    if (req.body && req.body.password) {
      return res.status(403).json({
        message: 'Demo account password cannot be changed'
      });
    }

    // Check for account deletion
    if (req.method === 'DELETE' && req.path.includes('/users')) {
      return res.status(403).json({
        message: 'Demo account cannot be deleted'
      });
    }

    // For expense operations
    if (req.path.includes('/expenses')) {
      // Check expense limit for POST requests
      if (req.method === 'POST') {
        const Expense = require('../models/Expense');
        const expenseCount = await Expense.countDocuments({ user: req.user.userId });
        
        if (expenseCount >= 10) {
          return res.status(403).json({
            message: 'Demo account cannot create more than 10 expenses'
          });
        }
      }
      
      // Prevent modifying demo data
      if (['PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return res.status(403).json({
          message: 'Demo account cannot modify or delete expenses'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Demo restrictions error:', error);
    // Don't block the request on middleware errors, just log
    next();
  }
};

module.exports = demoRestrictions; 