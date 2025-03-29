const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { setupDemoData } = require('./scripts/setupDemoData');
const demoRestrictions = require('./middleware/demoRestrictions');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const expenseRoutes = require('./routes/expense.routes');
const savingsGoalsRoutes = require('./routes/savings-goals.routes');
const budgetRoutes = require('./routes/budget.routes');
const settingsRoutes = require('./routes/settings.routes');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/expense-tracker';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
// Auth routes (public)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Apply demo restrictions after public routes
app.use(demoRestrictions);

// Protected routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/savings-goals', savingsGoalsRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/settings', settingsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Connect to MongoDB
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Initialize demo data
  try {
    await setupDemoData();
    console.log('Demo data initialized');
    
    // Reset demo data every 24 hours
    setInterval(async () => {
      try {
        await setupDemoData();
        console.log('Demo data reset successful');
      } catch (error) {
        console.error('Error resetting demo data:', error);
      }
    }, 24 * 60 * 60 * 1000);
    
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 