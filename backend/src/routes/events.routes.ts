import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { resolveEventRole, requireOwner, requireStaffOrOwner } from '../middleware/eventRole';
import {
  createEvent, getEvents, getEvent, updateEvent, deleteEvent,
  inviteStaff, removeStaff, registerForEvent, unregisterFromEvent, getAttendees
} from '../controllers/events.controller';
import { createTeam, getTeams, joinTeam, leaveTeam } from '../controllers/teams.controller';
import { getQuestions, postQuestion, upvoteQuestion, getAnswers, postAnswer } from '../controllers/qa.controller';

const router = Router();

// Public event listing
router.get('/', optionalAuth, getEvents);

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

// Teams
router.post('/:eventId/teams', authenticate, createTeam);
router.get('/:eventId/teams', optionalAuth, getTeams);
router.post('/:eventId/teams/:teamId/join', authenticate, joinTeam);
router.delete('/:eventId/teams/:teamId/leave', authenticate, leaveTeam);

// Q&A
router.get('/:eventId/questions', optionalAuth, getQuestions);
router.post('/:eventId/questions', authenticate, postQuestion);
router.post('/:eventId/questions/:questionId/upvote', authenticate, upvoteQuestion);
router.get('/:eventId/questions/:questionId/answers', optionalAuth, getAnswers);
router.post('/:eventId/questions/:questionId/answers', authenticate, postAnswer);

export default router;
