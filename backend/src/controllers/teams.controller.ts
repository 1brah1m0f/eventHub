import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import { AuthRequest } from '../middleware/auth';

async function migrate() {
  await query(`ALTER TABLE teams ADD COLUMN IF NOT EXISTS leader_id UUID REFERENCES users(user_id) ON DELETE SET NULL`);
  await query(`ALTER TABLE teams ADD COLUMN IF NOT EXISTS description TEXT`);
  await query(`ALTER TABLE teams ALTER COLUMN event_id DROP NOT NULL`).catch(() => {});
  await query(`
    CREATE TABLE IF NOT EXISTS team_members (
      team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
      role VARCHAR(20) DEFAULT 'member',
      joined_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (team_id, user_id)
    )
  `);
}
migrate().catch(console.error);

export async function createTeam(req: AuthRequest, res: Response) {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Team name required' });
    const userId = req.user!.userId;
    const teamId = uuidv4();

    const { rows } = await query(
      `INSERT INTO teams (team_id, name, description, leader_id) VALUES ($1,$2,$3,$4) RETURNING *`,
      [teamId, name.trim(), description?.trim() || null, userId]
    );
    await query(
      `INSERT INTO team_members (team_id, user_id, role) VALUES ($1,$2,'leader') ON CONFLICT DO NOTHING`,
      [teamId, userId]
    );
    res.status(201).json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getMyTeams(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { rows } = await query(`
      SELECT t.*,
        tm.role as my_role,
        u.name as leader_name,
        (SELECT json_agg(
          json_build_object('user_id', u2.user_id, 'name', u2.name, 'avatar_url', u2.avatar_url, 'role', tm2.role)
          ORDER BY CASE WHEN tm2.role = 'leader' THEN 0 ELSE 1 END, tm2.joined_at ASC
        )
        FROM team_members tm2
        JOIN users u2 ON tm2.user_id = u2.user_id
        WHERE tm2.team_id = t.team_id) as members
      FROM teams t
      JOIN team_members tm ON t.team_id = tm.team_id AND tm.user_id = $1
      LEFT JOIN users u ON t.leader_id = u.user_id
      ORDER BY t.created_at DESC
    `, [userId]);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function addMember(req: AuthRequest, res: Response) {
  try {
    const { teamId } = req.params;
    const { email } = req.body;
    const userId = req.user!.userId;

    const { rows: [team] } = await query(`SELECT * FROM teams WHERE team_id = $1`, [teamId]);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.leader_id !== userId) return res.status(403).json({ error: 'Only team leader can add members' });

    const { rows: [target] } = await query(
      `SELECT user_id, name FROM users WHERE LOWER(email) = LOWER($1)`, [email]
    );
    if (!target) return res.status(404).json({ error: 'No user found with that email' });

    const { rows: existing } = await query(
      `SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2`, [teamId, target.user_id]
    );
    if (existing.length) return res.status(409).json({ error: 'User is already in the team' });

    await query(
      `INSERT INTO team_members (team_id, user_id, role) VALUES ($1,$2,'member')`,
      [teamId, target.user_id]
    );
    res.json({ message: 'Member added', user: target });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function removeMember(req: AuthRequest, res: Response) {
  try {
    const { teamId, userId: targetId } = req.params;
    const userId = req.user!.userId;

    const { rows: [team] } = await query(`SELECT * FROM teams WHERE team_id = $1`, [teamId]);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.leader_id !== userId) return res.status(403).json({ error: 'Only team leader can remove members' });
    if (targetId === userId) return res.status(400).json({ error: 'Leader cannot remove themselves' });

    await query(`DELETE FROM team_members WHERE team_id = $1 AND user_id = $2`, [teamId, targetId]);
    res.json({ message: 'Member removed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteTeam(req: AuthRequest, res: Response) {
  try {
    const { teamId } = req.params;
    const userId = req.user!.userId;

    const { rows: [team] } = await query(`SELECT * FROM teams WHERE team_id = $1`, [teamId]);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.leader_id !== userId) return res.status(403).json({ error: 'Only leader can delete team' });

    await query(`DELETE FROM teams WHERE team_id = $1`, [teamId]);
    res.json({ message: 'Team deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAvailableHackathons(_req: AuthRequest, res: Response) {
  try {
    const { rows } = await query(`
      SELECT e.event_id, e.title, e.date, e.location, e.cover_image
      FROM events e
      WHERE e.type = 'hackathon' AND e.status = 'published'
        AND (e.date IS NULL OR e.date > NOW())
        AND (e.access_type IS NULL OR e.access_type = 'public')
      ORDER BY e.date ASC NULLS LAST
      LIMIT 20
    `);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function registerTeamForEvent(req: AuthRequest, res: Response) {
  try {
    const { teamId, eventId } = req.params;
    const userId = req.user!.userId;

    const { rows: [team] } = await query(`SELECT * FROM teams WHERE team_id = $1`, [teamId]);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.leader_id !== userId) return res.status(403).json({ error: 'Only team leader can register' });

    const { rows: [event] } = await query(`SELECT type FROM events WHERE event_id = $1`, [eventId]);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.type !== 'hackathon') return res.status(400).json({ error: 'Team registration only for hackathons' });

    const { rows: members } = await query(`SELECT user_id FROM team_members WHERE team_id = $1`, [teamId]);

    for (const m of members) {
      await query(
        `INSERT INTO registrations (registration_id, event_id, user_id)
         VALUES ($1,$2,$3) ON CONFLICT (event_id, user_id) DO NOTHING`,
        [uuidv4(), eventId, m.user_id]
      );
    }

    res.json({ message: `Team registered! ${members.length} members added.`, count: members.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Legacy handlers kept for old event-scoped team routes
export async function getTeams(req: any, res: Response) {
  try {
    const { rows } = await query('SELECT * FROM teams WHERE event_id=$1', [req.event?.event_id]);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function joinTeam(req: any, res: Response) {
  try {
    const { teamId } = req.params;
    const { rows } = await query('SELECT * FROM teams WHERE team_id=$1', [teamId]);
    if (!rows.length) return res.status(404).json({ error: 'Team not found' });
    const team = rows[0];
    if ((team.member_ids || []).includes(req.user!.userId)) return res.status(409).json({ error: 'Already in team' });
    const updated = [...(team.member_ids || []), req.user!.userId];
    const { rows: result } = await query('UPDATE teams SET member_ids=$1 WHERE team_id=$2 RETURNING *', [updated, teamId]);
    res.json(result[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function leaveTeam(req: any, res: Response) {
  try {
    const { teamId } = req.params;
    const { rows } = await query('SELECT * FROM teams WHERE team_id=$1', [teamId]);
    if (!rows.length) return res.status(404).json({ error: 'Team not found' });
    const updated = (rows[0].member_ids || []).filter((id: string) => id !== req.user!.userId);
    await query('UPDATE teams SET member_ids=$1 WHERE team_id=$2', [updated, teamId]);
    res.json({ message: 'Left team' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
