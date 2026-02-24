import prisma from '../utils/prisma.js';
import { calculateNextRunDate } from '../utils/scheduleHelpers.js';

// Get all schedules for a business
export const getSchedules = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { page = 1, limit = 10, clientId, isActive } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { businessId };
    if (clientId) where.clientId = clientId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [schedules, total] = await Promise.all([
      prisma.recurringSchedule.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.recurringSchedule.count({ where }),
    ]);

    res.json({
      schedules,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single schedule
export const getSchedule = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { id } = req.params;

    const schedule = await prisma.recurringSchedule.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    next(error);
  }
};

// Create new recurring schedule
export const createSchedule = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const {
      name,
      clientId,
      amount,
      frequency,
      enabledDays,
      excludedDates,
      startDate,
      endDate,
      isActive,
    } = req.body;

    // Validate required fields
    if (!name || !clientId || !amount || !enabledDays || enabledDays.length === 0) {
      return res.status(400).json({
        message: 'Name, client, amount, and at least one enabled day are required',
      });
    }

    // Verify client belongs to business
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        businessId,
      },
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Calculate next run date
    const nextRunDate = calculateNextRunDate(
      enabledDays,
      excludedDates || [],
      startDate ? new Date(startDate) : new Date(),
      endDate ? new Date(endDate) : null
    );

    const schedule = await prisma.recurringSchedule.create({
      data: {
        name,
        clientId,
        amount: parseFloat(amount),
        frequency: frequency || 'custom',
        enabledDays: enabledDays.map((day) => parseInt(day)),
        excludedDates: excludedDates
          ? excludedDates.map((date) => new Date(date))
          : [],
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? isActive : true,
        businessId,
        nextRunDate,
      },
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

    res.status(201).json({
      message: 'Schedule created successfully',
      schedule,
    });
  } catch (error) {
    next(error);
  }
};

// Update schedule
export const updateSchedule = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { id } = req.params;
    const {
      name,
      amount,
      frequency,
      enabledDays,
      excludedDates,
      startDate,
      endDate,
      isActive,
    } = req.body;

    // Verify schedule exists and belongs to business
    const existingSchedule = await prisma.recurringSchedule.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!existingSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (frequency !== undefined) updateData.frequency = frequency;
    if (enabledDays !== undefined)
      updateData.enabledDays = enabledDays.map((day) => parseInt(day));
    if (excludedDates !== undefined)
      updateData.excludedDates = excludedDates.map((date) => new Date(date));
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined)
      updateData.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Recalculate next run date if schedule parameters changed
    if (enabledDays !== undefined || excludedDates !== undefined || startDate !== undefined || endDate !== undefined) {
      updateData.nextRunDate = calculateNextRunDate(
        updateData.enabledDays || existingSchedule.enabledDays,
        updateData.excludedDates || existingSchedule.excludedDates,
        updateData.startDate || existingSchedule.startDate,
        updateData.endDate !== undefined ? updateData.endDate : existingSchedule.endDate
      );
    }

    const schedule = await prisma.recurringSchedule.update({
      where: { id },
      data: updateData,
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

    res.json({
      message: 'Schedule updated successfully',
      schedule,
    });
  } catch (error) {
    next(error);
  }
};

// Delete schedule
export const deleteSchedule = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { id } = req.params;

    // Verify schedule exists and belongs to business
    const schedule = await prisma.recurringSchedule.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    await prisma.recurringSchedule.delete({
      where: { id },
    });

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Toggle schedule status (activate/deactivate)
export const toggleScheduleStatus = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { id } = req.params;

    // Verify schedule exists and belongs to business
    const existingSchedule = await prisma.recurringSchedule.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!existingSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    const schedule = await prisma.recurringSchedule.update({
      where: { id },
      data: {
        isActive: !existingSchedule.isActive,
      },
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

    res.json({
      message: `Schedule ${schedule.isActive ? 'activated' : 'deactivated'} successfully`,
      schedule,
    });
  } catch (error) {
    next(error);
  }
};
