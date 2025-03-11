// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const userRoutes = require("./Routes/userRoutes");
const expenseRoutes = require("./Routes/expenseRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGO_URL; // Using the Atlas URL from .env
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Use Routes
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});