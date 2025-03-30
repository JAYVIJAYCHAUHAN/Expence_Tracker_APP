const User = require('../models/User');

const register = async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: req.body.email },
        { userName: req.body.userName }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === req.body.email ? 
          'Email already registered' : 
          'Username already taken' 
      });
    }

    // Create new user
    const user = new User({
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password
    });
    await user.save();

    // Generate authentication token
    const token = await user.generateAuthToken();

    // Calculate token expiration time (1 hour from now)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Send response with user data and token
    res.status(201).json({ 
      user, 
      token,
      expiresAt,
      message: 'Registration successful. Token expires in 1 hour.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      message: 'Error registering user', 
      error: error.message,
      details: error.errors
    });
  }
};

const login = async (req, res) => {
  try {
    console.log('Login attempt with:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ 
        message: 'Email and password are required',
        details: { email: !!email, password: !!password }
      });
    }

    const user = await User.findOne({ email });
    console.log('User found:', !!user);
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid login credentials' });
    }
    
    try {
      const isMatch = await user.comparePassword(password);
      console.log('Password match result:', isMatch);
      
      if (!isMatch) {
        console.log('Password does not match');
        return res.status(401).json({ message: 'Invalid login credentials' });
      }
      
      const token = await user.generateAuthToken();
      console.log('Login successful, token generated');
      
      // Calculate token expiration time (1 hour from now)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      
      res.json({ 
        user, 
        token,
        expiresAt,
        message: 'Login successful. Token expires in 1 hour.'
      });
    } catch (compareError) {
      console.error('Error comparing passwords:', compareError);
      return res.status(500).json({ message: 'Error verifying credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const logout = async (req, res) => {
  try {
    const user = req.user;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    user.tokens = user.tokens.filter((t) => t.token !== token);
    await user.save();
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error });
  }
};

const getProfile = async (req, res) => {
  try {
    // Get the user ID from the request
    const userId = req.user.userId;
    
    // Find the complete user document
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return the user data without sensitive information
    res.json(user.toJSON());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
};

const updateProfile = async (req, res) => {
  try {
    // Get the user ID from the request
    const userId = req.user.userId;
    
    // Find the complete user document from the database
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const updates = req.body;
    const allowedUpdates = ['userName', 'email', 'password', 'fullName', 'bio', 'phone', 'avatarUrl'];
    console.log('updates', updates);
    
    // Validate that only allowed fields are being updated
    const updateFields = Object.keys(updates);
    const isValidOperation = updateFields.every(field => allowedUpdates.includes(field));
    
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates!' });
    }

    // Check if email is being updated and if it's already taken
    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ email: updates.email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    // Check if username is being updated and if it's already taken
    if (updates.userName && updates.userName !== user.userName) {
      const existingUser = await User.findOne({ userName: updates.userName });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Apply updates
    updateFields.forEach(field => {
      user[field] = updates[field];
    });

    await user.save();
    
    // Remove sensitive information before sending response
    const userResponse = user.toJSON();
    
    res.json({
      user: userResponse,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      message: 'Error updating profile', 
      error: error.message,
      details: error.errors
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile
}; 