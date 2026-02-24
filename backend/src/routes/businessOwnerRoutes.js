import express from 'express';
import {
  getDashboardStats,
  getDailyRecoveryChart,
  getMonthlyRecoveryChart,
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getClientDetails,
  createRecoveryTransaction,
  markPaymentPaid,
  getRecoveryTransactions,
  getCoinRules,
  updateCoinRules,
} from '../controllers/businessOwnerController.js';
import {
  getReports,
  getClientAnalytics,
  bulkCreateTransactions,
  updateTransaction,
  deleteTransaction,
  exportData,
} from '../controllers/reportsController.js';
import {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  toggleScheduleStatus,
} from '../controllers/scheduleController.js';
import { processRecurringSchedules } from '../services/cronService.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes require business owner access
router.use(authenticate, authorize('business_owner'));

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/dashboard/daily-chart', getDailyRecoveryChart);
router.get('/dashboard/monthly-chart', getMonthlyRecoveryChart);

// Client Management
router.get('/clients', getClients);
router.post('/clients', createClient);
router.get('/clients/:id', getClientDetails);
router.get('/clients/:clientId/analytics', getClientAnalytics);
router.put('/clients/:id', updateClient);
router.delete('/clients/:id', deleteClient);

// Recovery Transactions
router.get('/recovery-transactions', getRecoveryTransactions);
router.post('/recovery-transactions', createRecoveryTransaction);
router.post('/recovery-transactions/bulk', bulkCreateTransactions);
router.put('/recovery-transactions/:id', updateTransaction);
router.delete('/recovery-transactions/:id', deleteTransaction);
router.patch('/recovery-transactions/:id/mark-paid', markPaymentPaid);

// Coin Rules
router.get('/coin-rules', getCoinRules);
router.put('/coin-rules', updateCoinRules);

// Reports & Analytics
router.get('/reports', getReports);
router.get('/export', exportData);

// Recurring Schedules
router.get('/schedules', getSchedules);
router.post('/schedules', createSchedule);
router.get('/schedules/:id', getSchedule);
router.put('/schedules/:id', updateSchedule);
router.delete('/schedules/:id', deleteSchedule);
router.patch('/schedules/:id/toggle', toggleScheduleStatus);

// Manual Cron Trigger (for testing)
router.post('/schedules/trigger-cron', async (req, res) => {
  try {
    console.log('🔧 Manual cron trigger requested by:', req.user.email);
    await processRecurringSchedules();
    res.json({ 
      success: true, 
      message: 'Cron job executed successfully! Check console logs for details.' 
    });
  } catch (error) {
    console.error('Error in manual cron trigger:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to execute cron job',
      error: error.message 
    });
  }
});

export default router;
