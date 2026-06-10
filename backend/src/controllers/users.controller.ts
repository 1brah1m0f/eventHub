import { Request, Response } from 'express';
import { query } from '../config/db';

// GET /users/:id — public profile: basic info + stats + badges + event history
export async function getPublicProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const userRes = await query(
      `SELECT user_id, name, bio, skills, linkedin_url, x_url, instagram_url, avatar_url, created_at
       FROM users WHERE user_id = $1`,
      [id]
    );
    if (!userRes.rows.length) return res.status(404).json({ error: 'User not found' });
    const user = userRes.rows[0];

    // Stats
    const [attended, organized] = await Promise.all([
      query(
        `SELECT COUNT(*)::int AS n
         FROM registrations r JOIN events e ON r.event_id = e.event_id
         WHERE r.user_id = $1 AND e.status IN ('published','finished')`,
        [id]
      ),
      query(`SELECT COUNT(*)::int AS n FROM events WHERE created_by = $1`, [id]),
    ]);

    // Badges with event context
    const achievements = await query(
      `SELECT a.achievement_id, a.type, a.label, a.team_name, a.created_at,
              e.event_id, e.title AS event_title, e.type AS event_type
       FROM achievements a JOIN events e ON a.event_id = e.event_id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [id]
    );

    // Event history (public/finished events the user attended)
    const history = await query(
      `SELECT e.event_id, e.title, e.type, e.date, e.location, e.status, e.cover_image,
              r.role, r.registered_at
       FROM registrations r JOIN events e ON r.event_id = e.event_id
       WHERE r.user_id = $1 AND e.status IN ('published','finished')
       ORDER BY e.date DESC NULLS LAST`,
      [id]
    );

    res.json({
      user,
      stats: {
        events_attended: attended.rows[0].n,
        events_organized: organized.rows[0].n,
        badges: achievements.rows.length,
      },
      achievements: achievements.rows,
      history: history.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
