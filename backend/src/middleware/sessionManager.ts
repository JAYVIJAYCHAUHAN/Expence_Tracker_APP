import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

const activeSessions = new Map<string, Set<string>>();

// Clean up expired sessions every hour
setInterval(() => {
  activeSessions.clear();
}, 3600000);

export const sessionManager = async (req: Request, res: Response, next: NextFunction) => {
  const email = req.body.email;
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (email === 'demo@example.com') {
    const userSessions = activeSessions.get(email) || new Set();
    
    // For demo account: limit to 3 concurrent sessions
    if (userSessions.size >= 3 && !userSessions.has(token || '')) {
      return res.status(429).json({
        message: 'Maximum concurrent sessions reached for demo account. Please try again later.',
        maxSessions: 3
      });
    }

    if (token) {
      userSessions.add(token);
      activeSessions.set(email, userSessions);
    }
  }

  next();
}; 