import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { resolveEventRole, requireOwner, requireStaffOrOwner } from '../middleware/eventRole';
import {
  createEvent, getEvents, getMapEvents, getEvent, updateEvent, deleteEvent,
  inviteStaff, removeStaff, registerForEvent, unregisterFromEvent, getAttendees,
  getPendingRequests, reviewRegistration, regenerateInviteCode
} from '../controllers/events.controller';
import { createTeam, getTeams, joinTeam, leaveTeam } from '../controllers/teams.controller';
import { getQuestions, postQuestion, upvoteQuestion, getAnswers, postAnswer, editQuestion, deleteQuestion } from '../controllers/qa.controller';
import { getEventAchievements, awardAchievement, deleteAchievement } from '../controllers/achievements.controller';

const router = Router();

// Public event listing
router.get('/', optionalAuth, getEvents);
router.get('/map', getMapEvents);

// Create event
router.post('/', authenticate, createEvent);

// Single event routes — resolve role for all
router.use('/:eventId', optionalAuth, resolveEventRole);

router.get('/:eventId', getEvent);
router.patch('/:eventId', authenticate, requireStaffOrOwner, updateEvent);
router.delete('/:eventId', authenticate, requireOwner, deleteEvent);

// Staff management
router.post('/:eventId/staff', authenticate, requireOwner, inviteStaff);
router.delete('/:eventId/staff/:userId', authenticate, requireOwner, removeStaff);

// Registration
router.post('/:eventId/register', authenticate, registerForEvent);
router.delete('/:eventId/register', authenticate, unregisterFromEvent);
router.get('/:eventId/attendees', optionalAuth, getAttendees);
router.get('/:eventId/pending', authenticate, requireOwner, getPendingRequests);
router.patch('/:eventId/registrations/:userId', authenticate, requireOwner, reviewRegistration);
router.post('/:eventId/invite-code/regenerate', authenticate, requireOwner, regenerateInviteCode);

// Teams
router.post('/:eventId/teams', authenticate, createTeam);
router.get('/:eventId/teams', optionalAuth, getTeams);
router.post('/:eventId/teams/:teamId/join', authenticate, joinTeam);
router.delete('/:eventId/teams/:teamId/leave', authenticate, leaveTeam);

// Achievements — anyone can view, only staff/owner award or remove
router.get('/:eventId/achievements', optionalAuth, getEventAchievements);
router.post('/:eventId/achievements', authenticate, requireStaffOrOwner, awardAchievement);
router.delete('/:eventId/achievements/:achievementId', authenticate, requireStaffOrOwner, deleteAchievement);

// Q&A
router.get('/:eventId/questions', optionalAuth, getQuestions);
router.post('/:eventId/questions', authenticate, postQuestion);
router.post('/:eventId/questions/:questionId/upvote', authenticate, upvoteQuestion);
router.patch('/:eventId/questions/:questionId', authenticate, editQuestion);
router.delete('/:eventId/questions/:questionId', authenticate, deleteQuestion);
router.get('/:eventId/questions/:questionId/answers', optionalAuth, getAnswers);
router.post('/:eventId/questions/:questionId/answers', authenticate, postAnswer);

export default router;
