import express from 'express';
import {
  getDashboardStats,
  getAllBusinesses,
  toggleBusinessStatus,
  getBusinessDetails,
  updateBusiness,
  deleteBusiness,
  getSystemAnalytics,
  createBusiness,
} from '../controllers/superAdminController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes require super admin access
router.use(authenticate, authorize('super_admin'));

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getSystemAnalytics);
router.get('/businesses', getAllBusinesses);
router.post('/businesses', createBusiness);
router.get('/businesses/:id', getBusinessDetails);
router.put('/businesses/:id', updateBusiness);
router.delete('/businesses/:id', deleteBusiness);
router.patch('/businesses/:id/toggle-status', toggleBusinessStatus);

export default router;
