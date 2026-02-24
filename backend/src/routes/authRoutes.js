import express from 'express';
import { registerBusiness, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', registerBusiness);
router.post('/login', login);
router.get('/me', authenticate, getMe);

export default router;
