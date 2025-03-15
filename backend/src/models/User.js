const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  const user = this;
  
  if (user.isModified('password')) {
    // For demo account, store password as is
    if (user.email === 'demo@example.com') {
      return next();
    }
    // For all other accounts, hash the password
    try {
      user.password = await bcrypt.hash(user.password, 8);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Generate auth token
UserSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );
  
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

// Compare password for login
UserSchema.methods.comparePassword = async function(password) {
  try {
    // For demo account
    if (this.email === 'demo@example.com' && password === this.password) {
      return true;
    }
    
    // For regular accounts
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Remove sensitive data when converting to JSON
UserSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

module.exports = mongoose.model('User', UserSchema); 