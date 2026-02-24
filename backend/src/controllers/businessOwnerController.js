import prisma from '../utils/prisma.js';
import { AppError } from '../utils/errorHandler.js';
import bcrypt from 'bcryptjs';

export const getDashboardStats = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;

    const totalClients = await prisma.client.count({
      where: { businessId },
    });

    // Total recovery today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRecovery = await prisma.recoveryTransaction.aggregate({
      _sum: { amount: true },
      where: {
        businessId,
        status: 'paid',
        paidDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const totalPending = await prisma.recoveryTransaction.aggregate({
      _sum: { amount: true },
      where: {
        businessId,
        status: 'pending',
      },
    });

    const totalCoinsIssued = await prisma.coinWallet.aggregate({
      _sum: { balance: true },
      where: {
        client: {
          businessId,
        },
      },
    });

    res.json({
      success: true,
      data: {
        totalClients,
        totalRecoveryToday: todayRecovery._sum.amount || 0,
        totalPending: totalPending._sum.amount || 0,
        totalCoinsIssued: totalCoinsIssued._sum.balance || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDailyRecoveryChart = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const { days = 7 } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const transactions = await prisma.recoveryTransaction.findMany({
      where: {
        businessId,
        status: 'paid',
        paidDate: {
          gte: daysAgo,
        },
      },
      select: {
        amount: true,
        paidDate: true,
      },
    });

    // Group by date
    const chartData = {};
    transactions.forEach((transaction) => {
      const date = transaction.paidDate.toISOString().split('T')[0];
      chartData[date] = (chartData[date] || 0) + transaction.amount;
    });

    const formattedData = Object.keys(chartData).map((date) => ({
      date,
      amount: chartData[date],
    }));

    res.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyRecoveryChart = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const { months = 6 } = req.query;

    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months));

    const transactions = await prisma.recoveryTransaction.findMany({
      where: {
        businessId,
        status: 'paid',
        paidDate: {
          gte: monthsAgo,
        },
      },
      select: {
        amount: true,
        paidDate: true,
      },
    });

    // Group by month
    const chartData = {};
    transactions.forEach((transaction) => {
      const month = transaction.paidDate.toISOString().substring(0, 7); // YYYY-MM
      chartData[month] = (chartData[month] || 0) + transaction.amount;
    });

    const formattedData = Object.keys(chartData).map((month) => ({
      month,
      amount: chartData[month],
    }));

    res.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    next(error);
  }
};

// Client Management
export const getClients = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const { page = 1, limit = 10, search = '' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      businessId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          coinWallet: true,
          _count: {
            select: {
              recoveryTransactions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        clients,
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

export const createClient = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const { name, email, phone, address, password } = req.body;

    if (!name || !email || !password) {
      throw new AppError('Please provide name, email, and password', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          name,
          email,
          phone,
          address,
          businessId,
        },
      });

      // Create user account for client
      await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'client',
          businessId,
          clientId: client.id,
        },
      });

      // Create coin wallet
      await tx.coinWallet.create({
        data: {
          clientId: client.id,
          balance: 0,
        },
      });

      return client;
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.user.businessId;
    const { name, phone, address } = req.body;

    const client = await prisma.client.findFirst({
      where: { id, businessId },
    });

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    const updated = await prisma.client.update({
      where: { id },
      data: { name, phone, address },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.user.businessId;

    const client = await prisma.client.findFirst({
      where: { id, businessId },
    });

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    await prisma.client.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getClientDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.user.businessId;

    const client = await prisma.client.findFirst({
      where: { id, businessId },
      include: {
        coinWallet: true,
        recoveryTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    const totalPaid = await prisma.recoveryTransaction.aggregate({
      _sum: { amount: true },
      where: { clientId: id, status: 'paid' },
    });

    const totalPending = await prisma.recoveryTransaction.aggregate({
      _sum: { amount: true },
      where: { clientId: id, status: 'pending' },
    });

    res.json({
      success: true,
      data: {
        ...client,
        totalPaid: totalPaid._sum.amount || 0,
        totalPending: totalPending._sum.amount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Recovery Transaction Management
export const createRecoveryTransaction = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const { clientId, amount, dueDate, notes } = req.body;

    if (!clientId || !amount) {
      throw new AppError('Please provide clientId and amount', 400);
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, businessId },
    });

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    const transaction = await prisma.recoveryTransaction.create({
      data: {
        amount: parseFloat(amount),
        status: 'pending',
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        businessId,
        clientId,
      },
      include: {
        client: true,
      },
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

export const markPaymentPaid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.user.businessId;
    const { paymentMethod = 'manual', paymentReference } = req.body;

    const transaction = await prisma.recoveryTransaction.findFirst({
      where: { id, businessId },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (transaction.status === 'paid') {
      throw new AppError('Transaction already paid', 400);
    }

    // Get coin rule for the business
    const coinRule = await prisma.coinRule.findUnique({
      where: { businessId },
    });

    if (!coinRule) {
      throw new AppError('Coin rule not found. Please set up coin rules.', 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update transaction status
      const updated = await tx.recoveryTransaction.update({
        where: { id },
        data: {
          status: 'paid',
          paymentMethod,
          paymentReference,
          paidDate: new Date(),
        },
      });

      // Calculate coins earned
      const coinsEarned = Math.floor(transaction.amount / coinRule.recoveryAmountPerCoin);

      if (coinsEarned > 0) {
        // Update coin wallet
        await tx.coinWallet.update({
          where: { clientId: transaction.clientId },
          data: {
            balance: {
              increment: coinsEarned,
            },
          },
        });

        // Create coin transaction record
        await tx.coinTransaction.create({
          data: {
            amount: coinsEarned,
            type: 'earned',
            description: `Earned ${coinsEarned} coins for payment of ${transaction.amount}`,
            clientId: transaction.clientId,
          },
        });
      }

      return updated;
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecoveryTransactions = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const { page = 1, limit = 10, status, clientId } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      businessId,
      ...(status && { status }),
      ...(clientId && { clientId }),
    };

    const [transactions, total] = await Promise.all([
      prisma.recoveryTransaction.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
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

// Coin Rules Management
export const getCoinRules = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;

    const coinRule = await prisma.coinRule.findUnique({
      where: { businessId },
    });

    res.json({
      success: true,
      data: coinRule,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoinRules = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const { recoveryAmountPerCoin, minClaimCoins, coinValueDescription } = req.body;

    const coinRule = await prisma.coinRule.upsert({
      where: { businessId },
      update: {
        recoveryAmountPerCoin: recoveryAmountPerCoin ? parseFloat(recoveryAmountPerCoin) : undefined,
        minClaimCoins: minClaimCoins ? parseInt(minClaimCoins) : undefined,
        coinValueDescription,
      },
      create: {
        businessId,
        recoveryAmountPerCoin: parseFloat(recoveryAmountPerCoin) || 100,
        minClaimCoins: parseInt(minClaimCoins) || 10,
        coinValueDescription: coinValueDescription || '1 coin = 1 unit value',
      },
    });

    res.json({
      success: true,
      data: coinRule,
    });
  } catch (error) {
    next(error);
  }
};
