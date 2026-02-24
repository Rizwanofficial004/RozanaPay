import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './utils/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import businessOwnerRoutes from './routes/businessOwnerRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import { processRecurringSchedules } from './services/cronService.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Vercel Cron: process recurring schedules (called daily at midnight)
// Secured by CRON_SECRET - Vercel sends this in Authorization header
app.get('/api/cron/process-schedules', async (req, res) => {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    await processRecurringSchedules();
    res.json({ success: true, message: 'Recurring schedules processed' });
  } catch (error) {
    console.error('Cron job error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/business-owner', businessOwnerRoutes);
app.use('/api/client', clientRoutes);

// Payment Gateway Webhook Placeholder (Future Integration)
app.post('/api/webhooks/payment', (req, res) => {
  console.log('Payment webhook received:', req.body);
  res.json({ success: true, message: 'Webhook received' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
