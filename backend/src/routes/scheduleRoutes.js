import express from 'express';
import {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  toggleScheduleStatus,
} from '../controllers/scheduleController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes require business_owner authentication
router.use(authenticate);
router.use(authorize(['business_owner']));

// Schedule routes
router.get('/schedules', getSchedules);
router.post('/schedules', createSchedule);
router.get('/schedules/:id', getSchedule);
router.put('/schedules/:id', updateSchedule);
router.delete('/schedules/:id', deleteSchedule);
router.patch('/schedules/:id/toggle', toggleScheduleStatus);

export default router;
