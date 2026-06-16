import { Router } from 'express';
import { register, login, sendCode, verifyCode, me, updateProfile, myEvents, myRegistrations, myStaffEvents } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-code', sendCode);
router.post('/verify-code', verifyCode);
router.get('/me', authenticate, me);
router.patch('/me', authenticate, updateProfile);
router.get('/me/events', authenticate, myEvents);
router.get('/me/registrations', authenticate, myRegistrations);
router.get('/me/staff-events', authenticate, myStaffEvents);

export default router;
