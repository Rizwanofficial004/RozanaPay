import prisma from '../utils/prisma.js';
import { AppError } from '../utils/errorHandler.js';

export const getReports = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const { startDate, endDate, type = 'summary' } = req.query;

    const where = {
      businessId,
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    if (type === 'summary') {
      const [
        totalClients,
        totalTransactions,
        paidTransactions,
        pendingTransactions,
        totalRevenue,
        totalPending,
        totalCoins,
      ] = await Promise.all([
        prisma.client.count({ where: { businessId } }),
        prisma.recoveryTransaction.count({ where }),
        prisma.recoveryTransaction.count({ where: { ...where, status: 'paid' } }),
        prisma.recoveryTransaction.count({ where: { ...where, status: 'pending' } }),
        prisma.recoveryTransaction.aggregate({
          where: { ...where, status: 'paid' },
          _sum: { amount: true },
        }),
        prisma.recoveryTransaction.aggregate({
          where: { ...where, status: 'pending' },
          _sum: { amount: true },
        }),
        prisma.coinWallet.aggregate({
          where: { client: { businessId } },
          _sum: { balance: true },
        }),
      ]);

      res.json({
        success: true,
        data: {
          totalClients,
          totalTransactions,
          paidTransactions,
          pendingTransactions,
          totalRevenue: totalRevenue._sum.amount || 0,
          totalPending: totalPending._sum.amount || 0,
          totalCoins: totalCoins._sum.balance || 0,
          averageTransactionValue: totalRevenue._sum.amount 
            ? (totalRevenue._sum.amount / paidTransactions) 
            : 0,
        },
      });
    } else if (type === 'detailed') {
      const transactions = await prisma.recoveryTransaction.findMany({
        where,
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
      });

      res.json({
        success: true,
        data: transactions,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getClientAnalytics = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const { clientId } = req.params;

    const client = await prisma.client.findFirst({
      where: { id: clientId, businessId },
      include: {
        coinWallet: true,
      },
    });

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    const [totalPaid, totalPending, transactionHistory, coinHistory, paymentStats] = await Promise.all([
      prisma.recoveryTransaction.aggregate({
        where: { clientId, status: 'paid' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.recoveryTransaction.aggregate({
        where: { clientId, status: 'pending' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.recoveryTransaction.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.coinTransaction.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.recoveryTransaction.groupBy({
        by: ['status'],
        where: { clientId },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    // Calculate payment trends
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyPayments = await prisma.recoveryTransaction.findMany({
      where: {
        clientId,
        status: 'paid',
        paidDate: { gte: sixMonthsAgo },
      },
      select: {
        amount: true,
        paidDate: true,
      },
    });

    const paymentTrends = {};
    monthlyPayments.forEach(p => {
      const month = p.paidDate.toISOString().substring(0, 7);
      paymentTrends[month] = (paymentTrends[month] || 0) + p.amount;
    });

    res.json({
      success: true,
      data: {
        client,
        totalPaid: totalPaid._sum.amount || 0,
        totalPending: totalPending._sum.amount || 0,
        paidCount: totalPaid._count,
        pendingCount: totalPending._count,
        transactionHistory,
        coinHistory,
        paymentStats,
        paymentTrends,
        averagePayment: totalPaid._count > 0 
          ? (totalPaid._sum.amount / totalPaid._count) 
          : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const bulkCreateTransactions = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const { transactions } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      throw new AppError('Please provide an array of transactions', 400);
    }

    // Validate all clients exist
    const clientIds = transactions.map(t => t.clientId);
    const clients = await prisma.client.findMany({
      where: {
        id: { in: clientIds },
        businessId,
      },
    });

    if (clients.length !== clientIds.length) {
      throw new AppError('Some clients not found', 404);
    }

    const created = await prisma.recoveryTransaction.createMany({
      data: transactions.map(t => ({
        amount: parseFloat(t.amount),
        status: 'pending',
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
        notes: t.notes || null,
        businessId,
        clientId: t.clientId,
      })),
    });

    res.status(201).json({
      success: true,
      data: {
        count: created.count,
        message: `${created.count} transactions created successfully`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.user.businessId;
    const { amount, dueDate, notes } = req.body;

    const transaction = await prisma.recoveryTransaction.findFirst({
      where: { id, businessId },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (transaction.status === 'paid') {
      throw new AppError('Cannot update paid transactions', 400);
    }

    const updated = await prisma.recoveryTransaction.update({
      where: { id },
      data: {
        ...(amount && { amount: parseFloat(amount) }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(notes !== undefined && { notes }),
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessId = req.user.businessId;

    const transaction = await prisma.recoveryTransaction.findFirst({
      where: { id, businessId },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (transaction.status === 'paid') {
      throw new AppError('Cannot delete paid transactions', 400);
    }

    await prisma.recoveryTransaction.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const exportData = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;
    const { type, startDate, endDate } = req.query;

    const where = {
      businessId,
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    let data;

    switch (type) {
      case 'clients':
        data = await prisma.client.findMany({
          where: { businessId },
          include: {
            coinWallet: true,
            _count: {
              select: {
                recoveryTransactions: true,
              },
            },
          },
        });
        break;

      case 'transactions':
        data = await prisma.recoveryTransaction.findMany({
          where,
          include: {
            client: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        break;

      case 'coins':
        data = await prisma.coinTransaction.findMany({
          where: {
            client: { businessId },
            ...(startDate && endDate && {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            }),
          },
          include: {
            client: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        break;

      default:
        throw new AppError('Invalid export type', 400);
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};