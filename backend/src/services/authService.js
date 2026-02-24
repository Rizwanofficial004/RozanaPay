import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

export const registerBusiness = async (userData, businessData) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email }
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = await prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      role: 'business_owner',
      business: {
        create: {
          name: businessData.name,
          isActive: true
        }
      }
    },
    include: {
      business: true
    }
  });

  // Create default coin rule for the business
  await prisma.coinRule.create({
    data: {
      businessId: user.business.id,
      recoveryAmountPerCoin: 100,
      minClaimCoins: 10,
      coinValueDescription: '1 coin = ₹10 value'
    }
  });

  const token = generateToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      business: user.business
    },
    token
  };
};

export const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { business: true }
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      business: user.business
    },
    token
  };
};

export const clientLogin = async (email, password, businessId) => {
  const client = await prisma.client.findFirst({
    where: {
      email,
      businessId
    }
  });

  if (!client) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, client.password);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(client.id, 'client');

  return {
    client: {
      id: client.id,
      email: client.email,
      name: client.name,
      shopName: client.shopName,
      businessId: client.businessId
    },
    token
  };
};
