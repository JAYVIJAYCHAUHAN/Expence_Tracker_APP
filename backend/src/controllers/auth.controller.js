const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const crypto = require('crypto');

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
    
    // Create new user (the password will be hashed by the pre-save hook)
    const newUser = new User({
      name,
      email,
      password
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
    
    // Check password using the model's comparePassword method
    const isPasswordValid = await user.comparePassword(password);
    
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
 * Request password reset
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }
    
    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token and store it in the user document
    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(resetToken, salt);
    
    // Set token and expiration (1 hour from now)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();
    
    // Simulate sending an email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${user._id}/${resetToken}`;
    console.log('Email would be sent to:', email);
    console.log('Reset URL:', resetUrl);
    console.log('Token valid for 1 hour');
    
    // Return the reset token (in a real app, you wouldn't send this directly)
    // We're returning this for the demo purpose
    return res.status(200).json({ 
      message: 'Password reset instructions sent to your email. Please check your inbox.',
      resetToken,
      userId: user._id
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({ message: 'Server error during password reset request' });
  }
};

/**
 * Reset password using token
 */
const resetPassword = async (req, res) => {
  try {
    const { userId, token, newPassword } = req.body;
    
    if (!userId || !token || !newPassword) {
      return res.status(400).json({ message: 'User ID, token, and new password are required' });
    }
    
    // Find user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if reset token exists and is valid
    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.status(400).json({ message: 'Invalid password reset token' });
    }
    
    // Check if token has expired
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'Password reset token has expired' });
    }
    
    // Verify the token
    const isValidToken = await bcrypt.compare(token, user.resetPasswordToken);
    
    if (!isValidToken) {
      return res.status(400).json({ message: 'Invalid password reset token' });
    }
    
    // Update password and clear reset token fields
    // The password will be hashed by the pre-save hook
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    
    await user.save();
    
    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ message: 'Server error during password reset' });
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
  validateToken,
  requestPasswordReset,
  resetPassword
}; 