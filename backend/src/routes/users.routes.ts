import { Router } from 'express';
import { getPublicProfile } from '../controllers/users.controller';

const router = Router();

router.get('/:id', getPublicProfile);

export default router;
