import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createTeam, getMyTeams, addMember, removeMember,
  deleteTeam, getAvailableHackathons, registerTeamForEvent, updateMemberRole,
} from '../controllers/teams.controller';

const router = Router();
router.use(authenticate);

router.post('/', createTeam);
router.get('/my', getMyTeams);
router.get('/hackathons', getAvailableHackathons);
router.post('/:teamId/members', addMember);
router.patch('/:teamId/members/:userId/role', updateMemberRole);
router.delete('/:teamId/members/:userId', removeMember);
router.delete('/:teamId', deleteTeam);
router.post('/:teamId/register/:eventId', registerTeamForEvent);

export default router;
