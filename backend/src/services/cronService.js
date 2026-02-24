import cron from 'node-cron';
import prisma from '../utils/prisma.js';
import { shouldRunToday, calculateNextRunDate } from '../utils/scheduleHelpers.js';

// Only run node-cron when not on Vercel (Vercel uses its own Cron via /api/cron/process-schedules)
if (!process.env.VERCEL) {
  cron.schedule('0 0 * * *', async () => {
    console.log('🕐 Running recurring transaction job at midnight...');
    await processRecurringSchedules();
  });
  console.log('✅ Cron service initialized - scheduled to run at midnight (00:00)');
}

// Main function to process all active schedules
export const processRecurringSchedules = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay(); // 0-6

    console.log(`📅 Processing schedules for ${today.toDateString()} (Day ${dayOfWeek})`);

    // Find all active schedules that should run
    const schedules = await prisma.recurringSchedule.findMany({
      where: {
        isActive: true,
        // startDate: { lte: today },
        OR: [
          { endDate: null },
          { endDate: { gte: today } },
        ],
      },
      include: {
        business: true,
        client: true,
      },
    });
    console.log("🚀 ~ processRecurringSchedules ~ schedules:", schedules)

    console.log(`📋 Found ${schedules.length} active schedules`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const schedule of schedules) {
      if (shouldRunToday(schedule, today, dayOfWeek)) {
        try {
          await createTransactionFromSchedule(schedule, today);
          await updateScheduleLastRun(schedule.id, today);
          createdCount++;
          console.log(`✅ Created transaction for schedule: ${schedule.name}`);
        } catch (error) {
          console.error(`❌ Error creating transaction for schedule ${schedule.name}:`, error);
        }
      } else {
        skippedCount++;
        console.log(`⏭️  Skipped schedule: ${schedule.name}`);
      }
    }

    console.log(`✨ Job completed: ${createdCount} transactions created, ${skippedCount} schedules skipped`);
  } catch (error) {
    console.error('❌ Error in processRecurringSchedules:', error);
  }
};

// Create a recovery transaction from a schedule
const createTransactionFromSchedule = async (schedule, today) => {
  try {
    const transaction = await prisma.recoveryTransaction.create({
      data: {
        amount: schedule.amount,
        status: 'pending',
        paymentMethod: null,
        paymentReference: null,
        dueDate: today,
        notes: `Auto-generated from schedule: ${schedule.name}`,
        businessId: schedule.businessId,
        clientId: schedule.clientId,
      },
    });

    return transaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

// Update schedule's last run date and calculate next run date
const updateScheduleLastRun = async (scheduleId, runDate) => {
  try {
    const schedule = await prisma.recurringSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      return;
    }

    // Calculate next run date
    const nextRunDate = calculateNextRunDate(
      schedule.enabledDays,
      schedule.excludedDates,
      new Date(),
      schedule.endDate
    );

    await prisma.recurringSchedule.update({
      where: { id: scheduleId },
      data: {
        lastRunDate: runDate,
        nextRunDate: nextRunDate,
      },
    });
  } catch (error) {
    console.error('Error updating schedule last run:', error);
    throw error;
  }
};

// Manual trigger for testing (can be called from API endpoint if needed)
export const triggerScheduleProcessing = async () => {
  console.log('🔧 Manually triggering schedule processing...');
  await processRecurringSchedules();
};
