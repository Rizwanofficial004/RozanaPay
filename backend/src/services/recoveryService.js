import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createRecoveryTransaction = async (transactionData, businessId) => {
  const client = await prisma.client.findFirst({
    where: {
      id: transactionData.clientId,
      businessId
    }
  });

  if (!client) {
    throw new Error('Client not found');
  }

  const transaction = await prisma.recoveryTransaction.create({
    data: {
      amount: transactionData.amount,
      status: transactionData.status || 'pending',
      paymentMethod: transactionData.paymentMethod,
      paymentReference: transactionData.paymentReference,
      businessId,
      clientId: transactionData.clientId,
      date: transactionData.date || new Date()
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          shopName: true
        }
      }
    }
  });

  // If status is paid, award coins
  if (transaction.status === 'paid') {
    await awardCoins(transaction.clientId, transaction.amount, businessId);
  }

  return transaction;
};

export const getRecoveryTransactions = async (businessId, filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const where = { businessId, ...filters };

  const [transactions, total] = await Promise.all([
    prisma.recoveryTransaction.findMany({
      where,
      skip,
      take: limit,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            shopName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.recoveryTransaction.count({ where })
  ]);

  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

export const markPaymentPaid = async (transactionId, businessId, paymentMethod = 'manual', paymentReference = null) => {
  const transaction = await prisma.recoveryTransaction.findFirst({
    where: {
      id: transactionId,
      businessId
    }
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.status === 'paid') {
    throw new Error('Transaction already marked as paid');
  }

  const updatedTransaction = await prisma.recoveryTransaction.update({
    where: { id: transactionId },
    data: {
      status: 'paid',
      paymentMethod,
      paymentReference
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          shopName: true
        }
      }
    }
  });

  // Award coins
  await awardCoins(transaction.clientId, transaction.amount, businessId);

  return updatedTransaction;
};

const awardCoins = async (clientId, amount, businessId) => {
  const coinRule = await prisma.coinRule.findUnique({
    where: { businessId }
  });

  if (!coinRule) {
    return;
  }

  const coinsEarned = Math.floor(amount / coinRule.recoveryAmountPerCoin);

  if (coinsEarned > 0) {
    await prisma.coinWallet.update({
      where: { clientId },
      data: {
        balance: {
          increment: coinsEarned
        }
      }
    });

    await prisma.coinTransaction.create({
      data: {
        amount: coinsEarned,
        type: 'earned',
        description: `Earned ${coinsEarned} coins from payment of ₹${amount}`,
        clientId
      }
    });
  }
};

export const getDashboardStats = async (businessId) => {
  const [
    totalClients,
    totalRecoveryToday,
    totalPending,
    totalCoinsIssued
  ] = await Promise.all([
    prisma.client.count({ where: { businessId } }),
    prisma.recoveryTransaction.aggregate({
      where: {
        businessId,
        status: 'paid',
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      _sum: { amount: true }
    }),
    prisma.recoveryTransaction.aggregate({
      where: {
        businessId,
        status: 'pending'
      },
      _sum: { amount: true }
    }),
    prisma.coinTransaction.aggregate({
      where: {
        client: {
          businessId
        },
        type: 'earned'
      },
      _sum: { amount: true }
    })
  ]);

  return {
    totalClients,
    totalRecoveryToday: totalRecoveryToday._sum.amount || 0,
    totalPending: totalPending._sum.amount || 0,
    totalCoinsIssued: totalCoinsIssued._sum.amount || 0
  };
};

export const getDailyRecoveryChart = async (businessId, days = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const transactions = await prisma.recoveryTransaction.findMany({
    where: {
      businessId,
      status: 'paid',
      date: {
        gte: startDate
      }
    },
    select: {
      amount: true,
      date: true
    }
  });

  const chartData = {};
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    chartData[dateStr] = 0;
  }

  transactions.forEach(transaction => {
    const dateStr = transaction.date.toISOString().split('T')[0];
    if (chartData[dateStr] !== undefined) {
      chartData[dateStr] += transaction.amount;
    }
  });

  return Object.keys(chartData)
    .sort()
    .map(date => ({
      date,
      amount: chartData[date]
    }));
};

export const getMonthlyRecoveryChart = async (businessId, months = 6) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const transactions = await prisma.recoveryTransaction.findMany({
    where: {
      businessId,
      status: 'paid',
      date: {
        gte: startDate
      }
    },
    select: {
      amount: true,
      date: true
    }
  });

  const chartData = {};

  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    chartData[monthStr] = 0;
  }

  transactions.forEach(transaction => {
    const date = transaction.date;
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (chartData[monthStr] !== undefined) {
      chartData[monthStr] += transaction.amount;
    }
  });

  return Object.keys(chartData)
    .sort()
    .map(month => ({
      month,
      amount: chartData[month]
    }));
};
