const demoRestrictions = async (req, res, next) => {
  try {
    // Debug who's accessing endpoints
    // if (req.user) {
    //   console.log(`[DemoRestrictions] Request by user: ${req.user.email} to ${req.method} ${req.path}`);
    // } else {
    //   console.log(`[DemoRestrictions] Request by unauthenticated user to ${req.method} ${req.path}`);
    // }
    
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
    // 3. Creating more than 2 expenses
    // 4. Creating more than 2 notes
    // 5. Modifying demo data

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
        if (expenseCount >= 4) {
          return res.status(403).json({
            message: 'Demo account cannot create more than 4 expenses'
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
   
    // For notes operations
    if (req.path.includes('/notes')) {
      // Check notes limit for POST requests
      if (req.method === 'POST') {
        const Note = require('../models/Note');
        const noteCount = await Note.countDocuments({ user: req.user.userId });        
        if (noteCount >= 3) {
          return res.status(403).json({
            message: 'Demo account cannot create more than 3 notes'
          });
        }
      }
      
      // Prevent modifying demo data
      if (['PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return res.status(403).json({
          message: 'Demo account cannot modify or delete notes'
        });
      }
    }
    next();
  } catch (error) {
    // Don't block the request on middleware errors, just log
    next();
  }
};

module.exports = demoRestrictions; 