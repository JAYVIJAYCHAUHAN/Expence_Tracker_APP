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

// Hash password before saving
UserSchema.pre('save', async function(next) {
  const user = this;
  
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password as string, 8);
  }
  
  next();
});

// Generate auth token
UserSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET || 'your-secret-key');
  
  user.tokens = user.tokens.concat({ token });
  await user.save();
  
  return token;
};

// Compare password for login
UserSchema.methods.comparePassword = async function(password: string) {
  return bcrypt.compare(password, this.password);
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