import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import { AuthRequest } from '../middleware/auth';

async function migrate() {
  await query(`ALTER TABLE teams ADD COLUMN IF NOT EXISTS leader_id UUID REFERENCES users(user_id) ON DELETE SET NULL`);
  await query(`ALTER TABLE teams ADD COLUMN IF NOT EXISTS description TEXT`);
  await query(`ALTER TABLE teams ADD COLUMN IF NOT EXISTS join_requests_open BOOLEAN DEFAULT true`);
  await query(`ALTER TABLE teams ALTER COLUMN event_id DROP NOT NULL`).catch(() => {});
  await query(`
    CREATE TABLE IF NOT EXISTS team_members (
      team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
      role VARCHAR(50) DEFAULT 'member',
      joined_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (team_id, user_id)
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS team_registrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
      event_id UUID REFERENCES events(event_id) ON DELETE CASCADE,
      registered_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(team_id, event_id)
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS team_invites (
      invite_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
      invited_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS team_join_requests (
      request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
      message TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_team_invites_user ON team_invites(user_id, status)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_team_join_requests_team ON team_join_requests(team_id, status)`);
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
        WHERE tm2.team_id = t.team_id) as members,
        (SELECT json_agg(
          json_build_object('event_id', e.event_id, 'title', e.title, 'date', e.date, 'location', e.location, 'cover_image', e.cover_image)
          ORDER BY e.date ASC
        )
        FROM team_registrations tr
        JOIN events e ON tr.event_id = e.event_id
        WHERE tr.team_id = t.team_id) as hackathons
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

export async function updateMemberRole(req: AuthRequest, res: Response) {
  try {
    const { teamId, userId: targetId } = req.params;
    const { role } = req.body;
    const userId = req.user!.userId;

    if (!role?.trim()) return res.status(400).json({ error: 'Role required' });

    const { rows: [team] } = await query(`SELECT * FROM teams WHERE team_id = $1`, [teamId]);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.leader_id !== userId) return res.status(403).json({ error: 'Only team leader can change roles' });
    if (targetId === userId) return res.status(400).json({ error: 'Cannot change leader role' });

    await query(`UPDATE team_members SET role = $1 WHERE team_id = $2 AND user_id = $3`, [role.trim(), teamId, targetId]);
    res.json({ message: 'Role updated' });
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
    if (team.leader_id !== userId) return res.status(403).json({ error: 'Only team leader can invite members' });

    const { rows: [target] } = await query(
      `SELECT user_id, name, email FROM users WHERE LOWER(email) = LOWER($1)`, [email]
    );
    if (!target) return res.status(404).json({ error: 'No user found with that email' });
    if (target.user_id === userId) return res.status(400).json({ error: 'Cannot invite yourself' });

    const { rows: existing } = await query(
      `SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2`, [teamId, target.user_id]
    );
    if (existing.length) return res.status(409).json({ error: 'User is already in the team' });

    const { rows: pendingInvite } = await query(
      `SELECT 1 FROM team_invites WHERE team_id = $1 AND user_id = $2 AND status = 'pending'`, [teamId, target.user_id]
    );
    if (pendingInvite.length) return res.status(409).json({ error: 'Invite already sent' });

    const inviteId = uuidv4();
    await query(
      `INSERT INTO team_invites (invite_id, team_id, user_id, invited_by) VALUES ($1,$2,$3,$4)`,
      [inviteId, teamId, target.user_id, userId]
    );
    res.status(201).json({ message: 'Invite sent', invite_id: inviteId, user: target });
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
        `INSERT INTO registrations (registration_id, event_id, user_id, team_name)
         VALUES ($1,$2,$3,$4) ON CONFLICT (event_id, user_id) DO UPDATE SET team_name = EXCLUDED.team_name`,
        [uuidv4(), eventId, m.user_id, team.name]
      );
    }

    await query(
      `INSERT INTO team_registrations (id, team_id, event_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      [uuidv4(), teamId, eventId]
    );

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
    const userId = req.user!.userId;

    const { rows: [team] } = await query(`SELECT * FROM teams WHERE team_id = $1`, [teamId]);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.leader_id === userId) return res.status(400).json({ error: 'Leader cannot leave — transfer leadership or delete the team' });

    const { rowCount } = await query(
      `DELETE FROM team_members WHERE team_id = $1 AND user_id = $2`, [teamId, userId]
    );
    if (!rowCount) return res.status(404).json({ error: 'You are not a member of this team' });

    res.json({ message: 'Left team' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateTeamSettings(req: AuthRequest, res: Response) {
  try {
    const { teamId } = req.params;
    const { join_requests_open } = req.body;
    const userId = req.user!.userId;

    const { rows: [team] } = await query(`SELECT * FROM teams WHERE team_id = $1`, [teamId]);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.leader_id !== userId) return res.status(403).json({ error: 'Only team leader can update settings' });

    const { rows } = await query(
      `UPDATE teams SET join_requests_open = $1 WHERE team_id = $2 RETURNING *`,
      [join_requests_open, teamId]
    );
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getOpenTeams(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { rows } = await query(`
      SELECT t.team_id, t.name, t.description, t.leader_id, t.join_requests_open, t.created_at,
        u.name as leader_name, u.avatar_url as leader_avatar,
        (SELECT COUNT(*)::int FROM team_members tm WHERE tm.team_id = t.team_id) as member_count,
        (SELECT json_agg(
          json_build_object('user_id', u2.user_id, 'name', u2.name, 'avatar_url', u2.avatar_url, 'role', tm2.role)
          ORDER BY CASE WHEN tm2.role = 'leader' THEN 0 ELSE 1 END, tm2.joined_at ASC
        )
        FROM team_members tm2
        JOIN users u2 ON tm2.user_id = u2.user_id
        WHERE tm2.team_id = t.team_id) as members,
        EXISTS(SELECT 1 FROM team_members tm3 WHERE tm3.team_id = t.team_id AND tm3.user_id = $1) as is_member,
        EXISTS(SELECT 1 FROM team_join_requests tjr WHERE tjr.team_id = t.team_id AND tjr.user_id = $1 AND tjr.status = 'pending') as has_pending_request
      FROM teams t
      LEFT JOIN users u ON t.leader_id = u.user_id
      ORDER BY t.created_at DESC
    `, [userId]);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getTeamById(req: AuthRequest, res: Response) {
  try {
    const { teamId } = req.params;
    const userId = req.user!.userId;
    const { rows } = await query(`
      SELECT t.*, u.name as leader_name, u.avatar_url as leader_avatar,
        (SELECT json_agg(
          json_build_object('user_id', u2.user_id, 'name', u2.name, 'avatar_url', u2.avatar_url, 'role', tm2.role)
          ORDER BY CASE WHEN tm2.role = 'leader' THEN 0 ELSE 1 END, tm2.joined_at ASC
        )
        FROM team_members tm2
        JOIN users u2 ON tm2.user_id = u2.user_id
        WHERE tm2.team_id = t.team_id) as members,
        EXISTS(SELECT 1 FROM team_members tm3 WHERE tm3.team_id = t.team_id AND tm3.user_id = $2) as is_member
      FROM teams t
      LEFT JOIN users u ON t.leader_id = u.user_id
      WHERE t.team_id = $1
    `, [teamId, userId]);
    if (!rows.length) return res.status(404).json({ error: 'Team not found' });
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getMyInvites(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { rows } = await query(`
      SELECT ti.*, t.name as team_name, t.description as team_description,
        u.name as invited_by_name,
        (SELECT COUNT(*)::int FROM team_members tm WHERE tm.team_id = t.team_id) as member_count
      FROM team_invites ti
      JOIN teams t ON ti.team_id = t.team_id
      LEFT JOIN users u ON ti.invited_by = u.user_id
      WHERE ti.user_id = $1 AND ti.status = 'pending'
      ORDER BY ti.created_at DESC
    `, [userId]);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function acceptInvite(req: AuthRequest, res: Response) {
  try {
    const { inviteId } = req.params;
    const userId = req.user!.userId;

    const { rows: [invite] } = await query(
      `SELECT * FROM team_invites WHERE invite_id = $1 AND user_id = $2 AND status = 'pending'`,
      [inviteId, userId]
    );
    if (!invite) return res.status(404).json({ error: 'Invite not found' });

    const { rows: existing } = await query(
      `SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2`, [invite.team_id, userId]
    );
    if (existing.length) {
      await query(`UPDATE team_invites SET status = 'accepted' WHERE invite_id = $1`, [inviteId]);
      return res.status(409).json({ error: 'Already in team' });
    }

    await query(
      `INSERT INTO team_members (team_id, user_id, role) VALUES ($1,$2,'member')`,
      [invite.team_id, userId]
    );
    await query(`UPDATE team_invites SET status = 'accepted' WHERE invite_id = $1`, [inviteId]);
    res.json({ message: 'Joined team!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function declineInvite(req: AuthRequest, res: Response) {
  try {
    const { inviteId } = req.params;
    const userId = req.user!.userId;

    const { rowCount } = await query(
      `UPDATE team_invites SET status = 'declined' WHERE invite_id = $1 AND user_id = $2 AND status = 'pending'`,
      [inviteId, userId]
    );
    if (!rowCount) return res.status(404).json({ error: 'Invite not found' });
    res.json({ message: 'Invite declined' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function requestToJoin(req: AuthRequest, res: Response) {
  try {
    const { teamId } = req.params;
    const { message } = req.body;
    const userId = req.user!.userId;

    const { rows: [team] } = await query(`SELECT * FROM teams WHERE team_id = $1`, [teamId]);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (!team.join_requests_open) return res.status(403).json({ error: 'This team is not accepting join requests' });

    const { rows: existing } = await query(
      `SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2`, [teamId, userId]
    );
    if (existing.length) return res.status(409).json({ error: 'Already in team' });

    const { rows: pending } = await query(
      `SELECT 1 FROM team_join_requests WHERE team_id = $1 AND user_id = $2 AND status = 'pending'`,
      [teamId, userId]
    );
    if (pending.length) return res.status(409).json({ error: 'Request already pending' });

    const requestId = uuidv4();
    await query(
      `INSERT INTO team_join_requests (request_id, team_id, user_id, message) VALUES ($1,$2,$3,$4)`,
      [requestId, teamId, userId, message?.trim() || null]
    );
    res.status(201).json({ message: 'Join request sent', request_id: requestId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getJoinRequests(req: AuthRequest, res: Response) {
  try {
    const { teamId } = req.params;
    const userId = req.user!.userId;

    const { rows: [team] } = await query(`SELECT * FROM teams WHERE team_id = $1`, [teamId]);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.leader_id !== userId) return res.status(403).json({ error: 'Only team leader can view join requests' });

    const { rows } = await query(`
      SELECT tjr.*, u.name, u.email, u.avatar_url
      FROM team_join_requests tjr
      JOIN users u ON tjr.user_id = u.user_id
      WHERE tjr.team_id = $1 AND tjr.status = 'pending'
      ORDER BY tjr.created_at ASC
    `, [teamId]);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function acceptJoinRequest(req: AuthRequest, res: Response) {
  try {
    const { requestId } = req.params;
    const userId = req.user!.userId;

    const { rows: [reqRow] } = await query(
      `SELECT tjr.*, t.leader_id FROM team_join_requests tjr
       JOIN teams t ON tjr.team_id = t.team_id
       WHERE tjr.request_id = $1 AND tjr.status = 'pending'`,
      [requestId]
    );
    if (!reqRow) return res.status(404).json({ error: 'Request not found' });
    if (reqRow.leader_id !== userId) return res.status(403).json({ error: 'Only team leader can accept requests' });

    const { rows: existing } = await query(
      `SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2`, [reqRow.team_id, reqRow.user_id]
    );
    if (!existing.length) {
      await query(
        `INSERT INTO team_members (team_id, user_id, role) VALUES ($1,$2,'member')`,
        [reqRow.team_id, reqRow.user_id]
      );
    }
    await query(`UPDATE team_join_requests SET status = 'accepted' WHERE request_id = $1`, [requestId]);
    res.json({ message: 'Member added to team' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function declineJoinRequest(req: AuthRequest, res: Response) {
  try {
    const { requestId } = req.params;
    const userId = req.user!.userId;

    const { rows: [reqRow] } = await query(
      `SELECT tjr.*, t.leader_id FROM team_join_requests tjr
       JOIN teams t ON tjr.team_id = t.team_id
       WHERE tjr.request_id = $1 AND tjr.status = 'pending'`,
      [requestId]
    );
    if (!reqRow) return res.status(404).json({ error: 'Request not found' });
    if (reqRow.leader_id !== userId) return res.status(403).json({ error: 'Only team leader can decline requests' });

    await query(`UPDATE team_join_requests SET status = 'declined' WHERE request_id = $1`, [requestId]);
    res.json({ message: 'Request declined' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getEventTeams(req: AuthRequest, res: Response) {
  try {
    const { eventId } = req.params;
    const { rows } = await query(`
      SELECT t.team_id, t.name, t.description, t.leader_id, t.join_requests_open,
        u.name as leader_name, u.avatar_url as leader_avatar,
        tr.registered_at,
        (SELECT json_agg(
          json_build_object('user_id', u2.user_id, 'name', u2.name, 'avatar_url', u2.avatar_url, 'role', tm2.role)
          ORDER BY CASE WHEN tm2.role = 'leader' THEN 0 ELSE 1 END, tm2.joined_at ASC
        )
        FROM team_members tm2
        JOIN users u2 ON tm2.user_id = u2.user_id
        WHERE tm2.team_id = t.team_id) as members
      FROM team_registrations tr
      JOIN teams t ON tr.team_id = t.team_id
      LEFT JOIN users u ON t.leader_id = u.user_id
      WHERE tr.event_id = $1
      ORDER BY tr.registered_at ASC
    `, [eventId]);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
