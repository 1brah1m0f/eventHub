import { Response, NextFunction } from 'express';
import { query } from '../config/db';
import { AuthRequest } from './auth';

// Attaches eventRole: 'owner' | 'staff' | 'visitor' to req
export async function resolveEventRole(req: AuthRequest & { eventRole?: string; event?: any }, res: Response, next: NextFunction) {
  const eventId = req.params.eventId || req.params.id;
  if (!eventId) return next();

  const { rows } = await query('SELECT * FROM events WHERE event_id = $1', [eventId]);
  if (!rows.length) return res.status(404).json({ error: 'Event not found' });

  req.event = rows[0];
  const userId = req.user?.userId;

  if (!userId) {
    req.eventRole = 'visitor';
    return next();
  }

  if (rows[0].created_by === userId) {
    req.eventRole = 'owner';
    return next();
  }

  const staff = await query('SELECT 1 FROM event_staff WHERE event_id=$1 AND user_id=$2', [eventId, userId]);
  if (staff.rows.length) { req.eventRole = 'staff'; return next(); }

  const reg = await query(
    "SELECT 1 FROM registrations WHERE event_id=$1 AND user_id=$2 AND (status IS NULL OR status='approved')",
    [eventId, userId]
  );
  req.eventRole = reg.rows.length ? 'attendee' : 'visitor';
  next();
}

export function requireOwner(req: AuthRequest & { eventRole?: string }, res: Response, next: NextFunction) {
  if (req.eventRole !== 'owner') return res.status(403).json({ error: 'Owner only' });
  next();
}

export function requireStaffOrOwner(req: AuthRequest & { eventRole?: string }, res: Response, next: NextFunction) {
  if (!['owner', 'staff'].includes(req.eventRole!)) return res.status(403).json({ error: 'Staff or owner only' });
  next();
}
