import express from 'express';
import {
  getDashboard,
  getTransactionHistory,
  getCoinBalance,
  requestClaim,
} from '../controllers/clientController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes require client access
router.use(authenticate, authorize('client'));

router.get('/dashboard', getDashboard);
router.get('/transactions', getTransactionHistory);
router.get('/coins', getCoinBalance);
router.post('/coins/claim', requestClaim);

export default router;
