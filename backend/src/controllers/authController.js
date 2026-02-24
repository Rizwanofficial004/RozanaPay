import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../utils/errorHandler.js';

export const registerBusiness = async (req, res, next) => {
  try {
    const { businessName, ownerName, email, password, phone, address } = req.body;

    // Validate required fields
    if (!businessName || !ownerName || !email || !password) {
      throw new AppError('Please provide all required fields', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create business and owner in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create business
      const business = await tx.business.create({
        data: {
          name: businessName,
          email,
          phone,
          address,
          isActive: true,
        },
      });

      // Create business owner user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: ownerName,
          role: 'business_owner',
          businessId: business.id,
        },
      });

      // Create default coin rule for the business
      await tx.coinRule.create({
        data: {
          businessId: business.id,
          recoveryAmountPerCoin: 100,
          minClaimCoins: 10,
          coinValueDescription: '1 coin = 1 unit value',
        },
      });

      return { user, business };
    });

    // Generate token
    const token = generateToken({ userId: result.user.id, role: result.user.role });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        },
        business: {
          id: result.business.id,
          name: result.business.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        business: true,
        client: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if business is active (except for super admin)
    if (user.role !== 'super_admin' && user.business && !user.business.isActive) {
      throw new AppError('Your business account is inactive. Please contact support.', 403);
    }

    // Generate token
    const token = generateToken({ userId: user.id, role: user.role });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        token,
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        business: true,
        client: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        businessId: true,
        clientId: true,
        business: true,
        client: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
