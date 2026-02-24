import prisma from '../utils/prisma.js';
import { AppError } from '../utils/errorHandler.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalBusinesses = await prisma.business.count();
    const activeBusinesses = await prisma.business.count({
      where: { isActive: true },
    });
    const inactiveBusinesses = totalBusinesses - activeBusinesses;
    const totalClients = await prisma.client.count();
    
    const totalRecovery = await prisma.recoveryTransaction.aggregate({
      _sum: { amount: true },
      where: { status: 'paid' },
    });

    const totalPending = await prisma.recoveryTransaction.aggregate({
      _sum: { amount: true },
      where: { status: 'pending' },
    });

    const totalTransactions = await prisma.recoveryTransaction.count();
    
    // Get recent activity
    const recentBusinesses = await prisma.business.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Get top businesses by revenue
    const topBusinesses = await prisma.business.findMany({
      take: 5,
      include: {
        recoveryTransactions: {
          where: { status: 'paid' },
        },
        _count: {
          select: {
            clients: true,
            recoveryTransactions: true,
          },
        },
      },
    });

    const topBusinessesWithRevenue = topBusinesses.map(business => {
      const revenue = business.recoveryTransactions.reduce((sum, t) => sum + t.amount, 0);
      return {
        id: business.id,
        name: business.name,
        revenue,
        clientCount: business._count.clients,
        transactionCount: business._count.recoveryTransactions,
        isActive: business.isActive,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Get monthly trends
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTransactions = await prisma.recoveryTransaction.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    const monthlyData = {};
    monthlyTransactions.forEach(t => {
      const month = t.createdAt.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, transactions: 0 };
      }
      if (t.status === 'paid') {
        monthlyData[month].revenue += t.amount;
      }
      monthlyData[month].transactions += 1;
    });

    res.json({
      success: true,
      data: {
        totalBusinesses,
        activeBusinesses,
        inactiveBusinesses,
        totalClients,
        totalRevenue: totalRecovery._sum.amount || 0,
        totalPending: totalPending._sum.amount || 0,
        totalTransactions,
        recentBusinesses,
        topBusinesses: topBusinessesWithRevenue,
        monthlyData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBusinesses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          _count: {
            select: {
              clients: true,
              recoveryTransactions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.business.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        businesses,
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

export const toggleBusinessStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const business = await prisma.business.findUnique({
      where: { id },
    });

    if (!business) {
      throw new AppError('Business not found', 404);
    }

    const updatedBusiness = await prisma.business.update({
      where: { id },
      data: { isActive: !business.isActive },
    });

    res.json({
      success: true,
      data: updatedBusiness,
    });
  } catch (error) {
    next(error);
  }
};

export const getBusinessDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            clients: true,
            recoveryTransactions: true,
            users: true,
          },
        },
        coinRules: true,
        users: {
          where: { role: 'business_owner' },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        clients: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            coinWallet: true,
            _count: {
              select: {
                recoveryTransactions: true,
              },
            },
          },
        },
      },
    });

    if (!business) {
      throw new AppError('Business not found', 404);
    }

    const totalRecovery = await prisma.recoveryTransaction.aggregate({
      _sum: { amount: true },
      where: { businessId: id, status: 'paid' },
    });

    const totalPending = await prisma.recoveryTransaction.aggregate({
      _sum: { amount: true },
      where: { businessId: id, status: 'pending' },
    });

    // Get recent transactions
    const recentTransactions = await prisma.recoveryTransaction.findMany({
      where: { businessId: id },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get monthly revenue trend
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const monthlyRevenue = await prisma.recoveryTransaction.findMany({
      where: {
        businessId: id,
        status: 'paid',
        paidDate: { gte: threeMonthsAgo },
      },
      select: {
        amount: true,
        paidDate: true,
      },
    });

    const revenueByMonth = {};
    monthlyRevenue.forEach(t => {
      const month = t.paidDate.toISOString().substring(0, 7);
      revenueByMonth[month] = (revenueByMonth[month] || 0) + t.amount;
    });

    res.json({
      success: true,
      data: {
        ...business,
        totalRecovery: totalRecovery._sum.amount || 0,
        totalPending: totalPending._sum.amount || 0,
        recentTransactions,
        revenueByMonth,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const business = await prisma.business.findUnique({
      where: { id },
    });

    if (!business) {
      throw new AppError('Business not found', 404);
    }

    const updated = await prisma.business.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
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

export const deleteBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            clients: true,
            recoveryTransactions: true,
          },
        },
      },
    });

    if (!business) {
      throw new AppError('Business not found', 404);
    }

    // Check if business has data
    if (business._count.clients > 0 || business._count.recoveryTransactions > 0) {
      throw new AppError('Cannot delete business with existing clients or transactions. Deactivate instead.', 400);
    }

    await prisma.business.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Business deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getSystemAnalytics = async (req, res, next) => {
  try {
    // Daily stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyTransactions = await prisma.recoveryTransaction.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    const dailyStats = {};
    dailyTransactions.forEach(t => {
      const date = t.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { revenue: 0, transactions: 0, pending: 0 };
      }
      dailyStats[date].transactions += 1;
      if (t.status === 'paid') {
        dailyStats[date].revenue += t.amount;
      } else {
        dailyStats[date].pending += t.amount;
      }
    });

    // Business growth
    const businessGrowth = await prisma.business.groupBy({
      by: ['createdAt'],
      _count: true,
      orderBy: { createdAt: 'asc' },
    });

    // Client growth
    const clientGrowth = await prisma.client.groupBy({
      by: ['createdAt'],
      _count: true,
      orderBy: { createdAt: 'asc' },
    });

    // Top performing businesses
    const businesses = await prisma.business.findMany({
      include: {
        recoveryTransactions: {
          where: { status: 'paid' },
        },
        _count: {
          select: {
            clients: true,
          },
        },
      },
    });

    const businessPerformance = businesses.map(b => ({
      id: b.id,
      name: b.name,
      revenue: b.recoveryTransactions.reduce((sum, t) => sum + t.amount, 0),
      clients: b._count.clients,
      transactions: b.recoveryTransactions.length,
    })).sort((a, b) => b.revenue - a.revenue);

    res.json({
      success: true,
      data: {
        dailyStats,
        businessPerformance,
        growthMetrics: {
          businessGrowth,
          clientGrowth,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createBusiness = async (req, res, next) => {
  try {
    const { businessName, ownerName, email, password, phone, address } = req.body;

    // Validate required fields
    if (!businessName || !ownerName || !email || !password) {
      throw new AppError('Please provide all required fields', 400);
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const existingBusiness = await prisma.business.findUnique({
      where: { email },
    });

    if (existingBusiness) {
      throw new AppError('Business email already registered', 400);
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(password, 10);

    // Create business and owner in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create business
      const business = await tx.business.create({
        data: {
          name: businessName,
          email,
          phone: phone || null,
          address: address || null,
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

    res.status(201).json({
      success: true,
      data: result.business,
      message: 'Business created successfully',
    });
  } catch (error) {
    next(error);
  }
};
