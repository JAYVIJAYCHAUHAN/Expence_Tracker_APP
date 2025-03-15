const User = require('../models/User');
const Expense = require('../models/Expense');

const setupDemoData = async () => {
  try {
    // Create or update demo user
    const demoUser = await User.findOneAndUpdate(
      { email: 'demo@example.com' },
      {
        email: 'demo@example.com',
        userName: 'demo',
        password: 'demo123'
      },
      { upsert: true, new: true }
    );

    // Clear existing demo expenses
    await Expense.deleteMany({ user: demoUser._id });

    // Create sample expenses
    const currentDate = new Date();
    const expenses = [
      {
        description: 'Groceries',
        amount: 150.50,
        category: 'Food',
        date: currentDate,
        user: demoUser._id
      },
      {
        description: 'Internet Bill',
        amount: 60.00,
        category: 'Utilities',
        date: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000),
        user: demoUser._id
      },
      {
        description: 'Movie Tickets',
        amount: 30.00,
        category: 'Entertainment',
        date: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000),
        user: demoUser._id
      }
    ];

    await Expense.insertMany(expenses);
    console.log('Demo data setup complete');
  } catch (error) {
    console.error('Error setting up demo data:', error);
    throw error;
  }
};

module.exports = { setupDemoData }; 