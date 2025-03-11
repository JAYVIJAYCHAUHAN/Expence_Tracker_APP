import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/expense-tracker';

async function resetDemoUser() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');

    // Find demo user
    const demoUser = await User.findOne({ email: 'demo@example.com' });
    
    if (demoUser) {
      // Generate new password hash
      const password = 'demo123';
      const hashedPassword = await bcrypt.hash(password, 8);
      
      // Update user with new hash
      demoUser.password = hashedPassword;
      await demoUser.save();
      
      console.log('Demo user password reset successfully');
      console.log('Email:', demoUser.email);
      console.log('New password hash:', hashedPassword);
    } else {
      // Create new demo user if doesn't exist
      const newDemoUser = new User({
        email: 'demo@example.com',
        password: 'demo123', // Will be hashed by the schema
        name: 'Demo User'
      });
      await newDemoUser.save();
      console.log('New demo user created successfully');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetDemoUser(); 