const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { setupDemoData } = require('./scripts/setupDemoData');
const demoRestrictions = require('./middleware/demoRestrictions');

// Routes
const userRoutes = require('./routes/user.routes');
const expenseRoutes = require('./routes/expense.routes');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/expense-tracker';

// Middleware
app.use(cors());
app.use(express.json());

// Apply demo restrictions to all routes
app.use(demoRestrictions);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);

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