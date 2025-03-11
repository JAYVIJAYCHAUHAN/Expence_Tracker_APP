import mongoose from 'mongoose';
import User from '../models/User';
import Expense from '../models/Expense';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/expense-tracker';

const sampleExpenses = [
  {
    description: 'Groceries',
    amount: 75.50,
    category: 'Food',
    date: new Date(),
    paymentMethod: 'credit'
  },
  {
    description: 'Movie Tickets',
    amount: 30.00,
    category: 'Entertainment',
    date: new Date(Date.now() - 86400000), // Yesterday
    paymentMethod: 'debit'
  },
  {
    description: 'Phone Bill',
    amount: 45.00,
    category: 'Bills',
    date: new Date(Date.now() - 172800000), // 2 days ago
    paymentMethod: 'online'
  },
  {
    description: 'Restaurant',
    amount: 60.00,
    category: 'Food',
    date: new Date(Date.now() - 259200000), // 3 days ago
    paymentMethod: 'credit'
  },
  {
    description: 'Gas',
    amount: 40.00,
    category: 'Transportation',
    date: new Date(Date.now() - 345600000), // 4 days ago
    paymentMethod: 'debit'
  }
];

export async function setupDemoData() {
  let connection: typeof mongoose | null = null;
  
  try {
    // Only connect if we're not already connected
    if (mongoose.connection.readyState !== 1) {
      connection = await mongoose.connect(MONGO_URL);
      console.log('Connected to MongoDB');
    }

    // Find or create demo user
    let demoUser = await User.findOne({ email: 'demo@example.com' });
    
    if (!demoUser) {
      demoUser = new User({
        email: 'demo@example.com',
        password: 'demo123',
        name: 'Demo User'
      });
      await demoUser.save();
      console.log('Demo user created');
    }

    // Now we're sure demoUser exists and is not null
    if (!demoUser) {
      throw new Error('Failed to create or find demo user');
    }

    console.log('Setting up expenses for demo user:', demoUser._id);

    // Delete existing demo expenses
    await Expense.deleteMany({ user: demoUser._id });

    // Create new sample expenses
    const expenses = await Promise.all(
      sampleExpenses.map(expense => 
        new Expense({
          ...expense,
          userId: demoUser._id // Changed from user to userId to match the schema
        }).save()
      )
    );

    console.log('Demo data reset successfully');
    console.log(`Created ${expenses.length} sample expenses`);

  } catch (error) {
    console.error('Error setting up demo data:', error);
    throw error; // Re-throw to handle in the app
  } finally {
    // Only disconnect if we created the connection
    if (connection) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
}

// If this script is run directly, execute setupDemoData
if (require.main === module) {
  setupDemoData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} 