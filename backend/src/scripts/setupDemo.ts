import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/expense_tracker';

async function setupDemoAccount() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if demo account already exists
    const existingDemo = await User.findOne({ email: 'demo@example.com' });
    if (existingDemo) {
      // Update existing demo account
      existingDemo.password = 'demo123'; // Will be hashed by the pre-save hook
      await existingDemo.save();
      console.log('Demo account password updated');
    } else {
      // Create new demo account
      const demoUser = new User({
        email: 'demo@example.com',
        password: 'demo123', // Will be hashed by the pre-save hook
        name: 'Demo User'
      });
      await demoUser.save();
      console.log('Demo account created successfully');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error setting up demo account:', error);
    await mongoose.disconnect();
  }
}

setupDemoAccount(); 