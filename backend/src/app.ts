import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { sessionManager } from './middleware/sessionManager';
import { demoRestrictions } from './middleware/demoRestrictions';
import userRoutes from './routes/user.routes';
import expenseRoutes from './routes/expense.routes';
import Expense from './models/Expense';
import { setupDemoData } from './scripts/setupDemoData'; // Import as a function

dotenv.config();

const app = express();

// Store models in app.locals for middleware access
app.locals.Expense = Expense;

// Middleware
app.use(cors());
app.use(express.json());

// Apply rate limiting and session management to login route
app.use('/api/users/login', sessionManager);

// Apply demo restrictions to all routes
app.use(demoRestrictions);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);

// MongoDB connection and demo data setup
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/expense-tracker')
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    
    // Set up demo data after successful connection
    try {
      await setupDemoData();
      console.log('Demo data initialized successfully');
      
      // Set up periodic reset of demo data
      setInterval(setupDemoData, 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Error setting up demo data:', error);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 