import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const protectRoute = async (req, res, next) => {
  try {
    // 1. Get token from cookies or Authorization header
    let token;
    
    if (req.cookies?.['jwt-netflix']) {  // Changed from 'jwt' to 'jwt-netflix'
      token = req.cookies['jwt-netflix'];
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token"
      });
    }

    // 2. Verify token format first
    if (typeof token !== 'string' || token.split('.').length !== 3) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format"
      });
    }

    // 3. Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Check if user exists (using 'id' instead of 'userId')
    const [users] = await db.query(
      'SELECT id, email FROM users WHERE id = ?',
      [decoded.id]  // Changed from decoded.userId to decoded.id
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      });
    }

    // 5. Attach user to request
    req.user = users[0];
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    
    let message = "Not authorized";
    if (error.name === 'JsonWebTokenError') {
      message = "Invalid token";
    } else if (error.name === 'TokenExpiredError') {
      message = "Token expired";
    }
    
    res.status(401).json({
      success: false,
      message
    });
  }
};

export { protectRoute };