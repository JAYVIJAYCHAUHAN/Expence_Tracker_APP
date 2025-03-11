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
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid login credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid login credentials' });
    }
    
    const token = await user.generateAuthToken();
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
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