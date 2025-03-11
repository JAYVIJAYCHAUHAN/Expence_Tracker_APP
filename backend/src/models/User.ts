import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  tokens: { token: string }[];
  generateAuthToken(): Promise<string>;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
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
  name: {
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

// Hash password before saving (except for demo account)
UserSchema.pre('save', async function(this: any, next) {
  if (this.email === 'demo@example.com') {
    return next();
  }
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
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
UserSchema.methods.comparePassword = async function(password: string) {
  try {
    console.log('Password comparison details:');
    console.log('Input password:', password);
    console.log('User email:', this.email);
    console.log('Stored password:', this.password);

    // Special handling for demo account with known hash
    if (this.email === 'demo@example.com' && 
        this.password === '$2a$08$WOqcsQ2XQ1OkLivmKu74..Ue9HtxIu2.d37d84bJt233n/X2uIx46' && 
        password === 'demo123') {
      console.log('Demo account matched with known credentials');
      return true;
    }
    
    // For all other cases, use bcrypt compare
    const isMatch = await bcrypt.compare(password, this.password);
    console.log('Password comparison result:', isMatch);
    return isMatch;
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

export default mongoose.model<IUser>('User', UserSchema); 