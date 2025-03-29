const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserSettings = require('../models/UserSettings');

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });
    
    const savedUser = await newUser.save();
    
    // Create default settings for user
    const userSettings = new UserSettings({
      userId: savedUser._id,
      features: {
        savingsGoals: false,
        budgetTips: false,
        dataExport: false,
        progressTracking: true
      },
      notifications: {
        budgetAlerts: true,
        achievementNotifications: true,
        featureTips: true
      },
      progress: {
        level: 1,
        points: 0,
        streak: 0,
        achievements: []
      }
    });
    
    await userSettings.save();
    
    // Generate JWT token
    const token = generateAuthToken(savedUser._id);
    
    // Return user info and token
    return res.status(201).json({
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * User login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = generateAuthToken(user._id);
    
    // Return user info and token
    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Logout user (client-side only in this implementation)
 */
const logout = async (req, res) => {
  try {
    // In this implementation, tokens are managed client-side
    // The client will delete the token from storage
    
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Server error during logout' });
  }
};

/**
 * Validate token
 */
const validateToken = async (req, res) => {
  try {
    // If middleware passed, token is valid
    return res.status(200).json({ 
      valid: true,
      user: {
        id: req.user.userId,
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({ message: 'Server error during token validation' });
  }
};

/**
 * Generate JWT token
 */
const generateAuthToken = (userId) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-default-jwt-secret',
    { expiresIn: '7d' }
  );
  return token;
};

module.exports = {
  register,
  login,
  logout,
  validateToken
}; 