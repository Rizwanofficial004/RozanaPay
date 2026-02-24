import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/errorHandler.js';
import prisma from '../utils/prisma.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      throw new AppError('Invalid or expired token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        business: true,
        client: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Check if business is active for business owners and clients
    if (user.role !== 'super_admin' && user.business && !user.business.isActive) {
      throw new AppError('Business is inactive', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Unauthorized access', 403));
    }
    next();
  };
};
