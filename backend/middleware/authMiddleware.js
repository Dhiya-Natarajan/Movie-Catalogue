import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { ENV_VARS } from '../config/envVars.js';

/**
 * Authentication middleware - verifies JWT token and attaches user to request
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);

    const [rows] = await pool.query(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    let message = 'Unauthorized';
    if (error.name === 'TokenExpiredError') {
      message = 'Token expired';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token';
    }

    return res.status(401).json({ 
      success: false,
      message 
    });
  }
};

/**
 * Authorization middleware - checks if user has required role
 * @param {string[]} allowedRoles - Array of allowed roles
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(403).json({ 
        success: false,
        message: 'No user role found' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to access this resource' 
      });
    }

    next();
  };
};

// For backward compatibility
export const protectRoute = authenticateUser;

// Default export (can be used as authMiddleware)
export default {
  authenticateUser,
  authorizeRoles,
  protectRoute
};