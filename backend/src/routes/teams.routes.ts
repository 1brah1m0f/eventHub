import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createTeam, getMyTeams, addMember, removeMember,
  deleteTeam, getAvailableHackathons, registerTeamForEvent, updateMemberRole,
  leaveTeam, updateTeamSettings, getOpenTeams, getTeamById,
  getMyInvites, acceptInvite, declineInvite,
  requestToJoin, getJoinRequests, acceptJoinRequest, declineJoinRequest,
  getEventTeams,
} from '../controllers/teams.controller';

const router = Router();
router.use(authenticate);

router.post('/', createTeam);
router.get('/my', getMyTeams);
router.get('/open', getOpenTeams);
router.get('/hackathons', getAvailableHackathons);
router.get('/invites/my', getMyInvites);
router.get('/event/:eventId', getEventTeams);
router.post('/invites/:inviteId/accept', acceptInvite);
router.post('/invites/:inviteId/decline', declineInvite);
router.post('/join-requests/:requestId/accept', acceptJoinRequest);
router.post('/join-requests/:requestId/decline', declineJoinRequest);
router.get('/:teamId', getTeamById);
router.patch('/:teamId', updateTeamSettings);
router.post('/:teamId/leave', leaveTeam);
router.post('/:teamId/members', addMember);
router.patch('/:teamId/members/:userId/role', updateMemberRole);
router.delete('/:teamId/members/:userId', removeMember);
router.delete('/:teamId', deleteTeam);
router.post('/:teamId/register/:eventId', registerTeamForEvent);
router.post('/:teamId/join-request', requestToJoin);
router.get('/:teamId/join-requests', getJoinRequests);

export default router;
