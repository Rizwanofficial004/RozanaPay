import prisma from '../utils/prisma.js';
import { AppError } from '../utils/errorHandler.js';

export const getDashboard = async (req, res, next) => {
  try {
    const clientId = req.user.clientId;

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        coinWallet: true,
      },
    });

    if (!client) {
      throw new AppError('Client profile not found', 404);
    }

    const totalPending = await prisma.recoveryTransaction.aggregate({
      _sum: { amount: true },
      where: {
        clientId,
        status: 'pending',
      },
    });

    const totalPaid = await prisma.recoveryTransaction.aggregate({
      _sum: { amount: true },
      where: {
        clientId,
        status: 'paid',
      },
    });

    const totalTransactions = await prisma.recoveryTransaction.count({
      where: { clientId },
    });

    res.json({
      success: true,
      data: {
        client,
        totalPending: totalPending._sum.amount || 0,
        totalPaid: totalPaid._sum.amount || 0,
        totalTransactions,
        coinBalance: client.coinWallet?.balance || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionHistory = async (req, res, next) => {
  try {
    const clientId = req.user.clientId;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      clientId,
      ...(status && { status }),
    };

    const [transactions, total] = await Promise.all([
      prisma.recoveryTransaction.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.recoveryTransaction.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCoinBalance = async (req, res, next) => {
  try {
    const clientId = req.user.clientId;

    const wallet = await prisma.coinWallet.findUnique({
      where: { clientId },
    });

    const transactions = await prisma.coinTransaction.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const coinRule = await prisma.coinRule.findUnique({
      where: { businessId: req.user.businessId },
    });

    res.json({
      success: true,
      data: {
        balance: wallet?.balance || 0,
        transactions,
        coinRule,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const requestClaim = async (req, res, next) => {
  try {
    const clientId = req.user.clientId;
    const { coinsToRedeem } = req.body;

    if (!coinsToRedeem || coinsToRedeem <= 0) {
      throw new AppError('Please provide valid coins to redeem', 400);
    }

    const wallet = await prisma.coinWallet.findUnique({
      where: { clientId },
    });

    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }

    const coinRule = await prisma.coinRule.findUnique({
      where: { businessId: req.user.businessId },
    });

    if (!coinRule) {
      throw new AppError('Coin rules not configured', 404);
    }

    if (coinsToRedeem < coinRule.minClaimCoins) {
      throw new AppError(`Minimum ${coinRule.minClaimCoins} coins required to claim`, 400);
    }

    if (wallet.balance < coinsToRedeem) {
      throw new AppError('Insufficient coin balance', 400);
    }

    // Deduct coins and create transaction
    await prisma.$transaction(async (tx) => {
      await tx.coinWallet.update({
        where: { clientId },
        data: {
          balance: {
            decrement: coinsToRedeem,
          },
        },
      });

      await tx.coinTransaction.create({
        data: {
          amount: -coinsToRedeem,
          type: 'claimed',
          description: `Claimed ${coinsToRedeem} coins`,
          clientId,
        },
      });
    });

    res.json({
      success: true,
      message: 'Claim request submitted successfully. Please contact your business for processing.',
    });
  } catch (error) {
    next(error);
  }
};
