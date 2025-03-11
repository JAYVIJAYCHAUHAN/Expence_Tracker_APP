import { Request, Response } from 'express';
import User from '../models/User';

export const register = async (req: Request, res: Response) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ message: 'Error registering user', error });
  }
};

export const login = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    user.tokens = user.tokens.filter((t: any) => t.token !== token);
    await user.save();
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
}; 