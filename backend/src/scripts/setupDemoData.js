const User = require('../models/User');
const Expense = require('../models/Expense');
const Note=require('../models/Note')
const SavingsGoal=require('../models/SavingsGoal')

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
        user: demoUser._id,
        paymentMethod: 'cash'
      },
      {
        description: 'Internet Bill',
        amount: 60.00,
        category: 'Utilities',
        date: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000),
        user: demoUser._id,
        paymentMethod: 'cash'
      },
      {
        description: 'Movie Tickets',
        amount: 30.00,
        category: 'Entertainment',
        date: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000),
        user: demoUser._id,
        paymentMethod: 'cash'
      }
    ];

    await Expense.insertMany(expenses);
    // notes hard coded data for demo
    await Note.deleteMany({ user: demoUser._id });
    const notes=[
      {
        title: "New Notes",
        content:"Demo User",
        color:"#DF1414",
         isPinned:false,
        tags:["Demo"],
        user: demoUser._id,
      },
        {
          title: "No ways",
          content:"Let's try App",
          color:"#05E645",
          isPinned:false,
         tags:["Demo"],
         user: demoUser._id,
        }
    ];
    await Note.insertMany(notes);
    console.log('Demo data setup complete');
  } catch (error) {
    console.error('Error setting up demo data:', error);
    throw error;
  }
};

module.exports = { setupDemoData }; 