import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/auth';

const authService = new AuthService();
const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    // Verify token and get user
    const user = await authService.verifyToken(token);
    
    // Add user to request object
    (req as any).user = user;
    
    next();
  } catch (error: any) {
    console.error('Authentication error:', error);
    
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const user = await authService.verifyToken(token);
        (req as any).user = user;
      } catch (error) {
        // Token is invalid, but we continue without user
        (req as any).user = null;
      }
    } else {
      (req as any).user = null;
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    (req as any).user = null;
    next();
  }
};