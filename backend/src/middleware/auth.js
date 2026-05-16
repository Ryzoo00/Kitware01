import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/user.model.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header or cookie
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      const error = new Error('Not authorized, no token');
      error.status = 401;
      throw error;
    }

    try {
      const decoded = verifyToken(token);
      console.log('Token decoded:', decoded);
      req.user = decoded;
      
      // Check if user still exists
      const user = await User.findById(decoded.userId);
      console.log('User found:', user ? user.email : 'NOT FOUND');
      if (!user) {
        const error = new Error('User not found');
        error.status = 401;
        throw error;
      }

      // Check if user is blocked
      if (user.isBlocked) {
        const error = new Error('Your account has been blocked');
        error.status = 403;
        throw error;
      }

      req.user.role = user.role;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      const err = new Error('Not authorized, token failed');
      err.status = 401;
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    const error = new Error('Not authorized as admin');
    error.status = 403;
    next(error);
  }
};
