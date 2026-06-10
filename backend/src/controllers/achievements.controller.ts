import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';

// Preset achievement types. Staff may also pass a custom `label`.
const VALID_TYPES = [
  'winner', 'runner_up', 'third_place', 'finalist',
  'best_design', 'best_pitch', 'special', 'participant',
];

// GET /events/:eventId/achievements — public list for an event
export async function getEventAchievements(req: Request & { event?: any }, res: Response) {
  try {
    const { rows } = await query(
      `SELECT a.achievement_id, a.type, a.label, a.team_name, a.created_at,
              u.user_id, u.name, u.avatar_url
       FROM achievements a
       JOIN users u ON a.user_id = u.user_id
       WHERE a.event_id = $1
       ORDER BY a.created_at DESC`,
      [req.event.event_id]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// POST /events/:eventId/achievements — staff/owner only (enforced by route middleware)
export async function awardAchievement(req: Request & { event?: any; user?: any }, res: Response) {
  try {
    const { user_id, type = 'participant', label, team_name } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });
    if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: 'Invalid achievement type' });

    // Recipient must actually be registered for this event.
    const reg = await query(
      'SELECT 1 FROM registrations WHERE event_id=$1 AND user_id=$2',
      [req.event.event_id, user_id]
    );
    if (!reg.rows.length) {
      return res.status(400).json({ error: 'User is not registered for this event' });
    }

    const { rows } = await query(
      `INSERT INTO achievements (achievement_id, event_id, user_id, type, label, team_name, awarded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING achievement_id, type, label, team_name, created_at`,
      [uuidv4(), req.event.event_id, user_id, type, label || null, team_name || null, req.user.userId]
    );
    res.status(201).json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /events/:eventId/achievements/:achievementId — staff/owner only
export async function deleteAchievement(req: Request & { event?: any }, res: Response) {
  try {
    await query(
      'DELETE FROM achievements WHERE achievement_id=$1 AND event_id=$2',
      [req.params.achievementId, req.event.event_id]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
