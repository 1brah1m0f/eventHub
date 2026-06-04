import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export async function createEvent(req: AuthRequest, res: Response) {
  try {
    const { title, description, type, date, end_date, location, cover_image, agenda, resources, extra_fields, access_type = 'public' } = req.body;
    if (!title || !type) return res.status(400).json({ error: 'title and type required' });

    const validAccess = ['public', 'invite_only', 'approval'];
    if (!validAccess.includes(access_type)) return res.status(400).json({ error: 'Invalid access_type' });

    const invite_code = access_type === 'invite_only' ? uuidv4() : null;

    const { rows } = await query(
      `INSERT INTO events (event_id, title, description, type, date, end_date, location, cover_image, agenda, resources, extra_fields, created_by, status, access_type, invite_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'draft',$13,$14)
       RETURNING *`,
      [uuidv4(), title, description, type, date, end_date, location, cover_image || null,
       agenda ? JSON.stringify(agenda) : null,
       resources ? JSON.stringify(resources) : null,
       extra_fields ? JSON.stringify(extra_fields) : null,
       req.user!.userId, access_type, invite_code]
    );
    res.status(201).json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getEvents(req: Request, res: Response) {
  try {
    const { type, status, search, page = '1', limit = '20' } = req.query as any;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = `SELECT e.*, u.name as owner_name, u.avatar_url as owner_avatar,
               (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.event_id AND (r.status IS NULL OR r.status='approved')) as attendee_count
               FROM events e LEFT JOIN users u ON e.created_by = u.user_id
               WHERE e.status != 'draft' AND (e.access_type IS NULL OR e.access_type != 'invite_only')`;
    const params: any[] = [];
    let idx = 1;

    if (type) { sql += ` AND e.type = $${idx++}`; params.push(type); }
    if (status) { sql += ` AND e.status = $${idx++}`; params.push(status); }
    if (search) { sql += ` AND (e.title ILIKE $${idx} OR e.description ILIKE $${idx++})`; params.push(`%${search}%`); }

    sql += ` ORDER BY e.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(parseInt(limit), offset);

    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getEvent(req: Request & { event?: any; eventRole?: string }, res: Response) {
  try {
    const event = req.event;
    const { rows: staff } = await query(
      `SELECT u.user_id, u.name, u.email, u.avatar_url FROM event_staff es
       JOIN users u ON es.user_id = u.user_id WHERE es.event_id=$1`,
      [event.event_id]
    );
    const { rows: regCounts } = await query(
      `SELECT role, COUNT(*) as count FROM registrations WHERE event_id=$1 GROUP BY role`,
      [event.event_id]
    );
    res.json({ ...event, staff, registration_counts: regCounts, viewer_role: req.eventRole });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateEvent(req: Request & { event?: any; user?: any }, res: Response) {
  try {
    const event = req.event;
    const fields = ['title','description','type','date','end_date','location','cover_image','agenda','resources','extra_fields','status'];
    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    for (const f of fields) {
      if (req.body[f] !== undefined) {
        const val = ['agenda','resources','extra_fields'].includes(f) ? JSON.stringify(req.body[f]) : req.body[f];
        updates.push(`${f}=$${idx++}`);
        params.push(val);
      }
    }
    if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });

    updates.push(`updated_at=NOW()`);
    params.push(event.event_id);
    const { rows } = await query(`UPDATE events SET ${updates.join(',')} WHERE event_id=$${idx} RETURNING *`, params);
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteEvent(req: Request & { event?: any }, res: Response) {
  try {
    await query('DELETE FROM events WHERE event_id=$1', [req.event.event_id]);
    res.json({ message: 'Event deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function inviteStaff(req: Request & { event?: any }, res: Response) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });

    const { rows: users } = await query('SELECT user_id FROM users WHERE email=$1', [email]);
    if (!users.length) return res.status(404).json({ error: 'User not found' });

    if (users[0].user_id === req.event.created_by) {
      return res.status(400).json({ error: 'You are the owner — cannot add yourself as staff' });
    }

    await query(
      'INSERT INTO event_staff (id, event_id, user_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
      [uuidv4(), req.event.event_id, users[0].user_id]
    );
    res.json({ message: 'Staff invited' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function removeStaff(req: Request & { event?: any }, res: Response) {
  try {
    const { userId } = req.params;
    await query('DELETE FROM event_staff WHERE event_id=$1 AND user_id=$2', [req.event.event_id, userId]);
    res.json({ message: 'Staff removed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function registerForEvent(req: AuthRequest & { event?: any }, res: Response) {
  try {
    const { role = 'attendee', team_name, team_members, invite_code } = req.body;
    const event = req.event;

    if (event.access_type === 'invite_only') {
      if (!invite_code || invite_code !== event.invite_code) {
        return res.status(403).json({ error: 'Valid invite code required' });
      }
    }

    const status = event.access_type === 'approval' ? 'pending' : 'approved';

    await query(
      `INSERT INTO registrations (registration_id, event_id, user_id, role, status, team_name, team_members)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (event_id, user_id) DO NOTHING`,
      [uuidv4(), event.event_id, req.user!.userId, role, status,
       team_name || null, team_members ? JSON.stringify(team_members) : null]
    );

    res.json({ message: status === 'pending' ? 'Request sent' : 'Registered', status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getPendingRequests(req: AuthRequest & { event?: any }, res: Response) {
  try {
    const { rows } = await query(
      `SELECT r.registration_id, r.role, r.registered_at, r.team_name, r.team_members,
              u.user_id, u.name, u.email, u.avatar_url
       FROM registrations r JOIN users u ON r.user_id = u.user_id
       WHERE r.event_id=$1 AND r.status='pending' ORDER BY r.registered_at`,
      [req.event.event_id]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function reviewRegistration(req: AuthRequest & { event?: any }, res: Response) {
  try {
    const { userId } = req.params;
    const { action } = req.body; // 'approve' | 'reject'
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'action must be approve or reject' });

    if (action === 'reject') {
      await query('DELETE FROM registrations WHERE event_id=$1 AND user_id=$2', [req.event.event_id, userId]);
    } else {
      await query(
        "UPDATE registrations SET status='approved' WHERE event_id=$1 AND user_id=$2",
        [req.event.event_id, userId]
      );
    }
    res.json({ message: action === 'approve' ? 'Approved' : 'Rejected' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function regenerateInviteCode(req: AuthRequest & { event?: any }, res: Response) {
  try {
    const newCode = uuidv4();
    const { rows } = await query(
      'UPDATE events SET invite_code=$1 WHERE event_id=$2 RETURNING invite_code',
      [newCode, req.event.event_id]
    );
    res.json({ invite_code: rows[0].invite_code });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function unregisterFromEvent(req: AuthRequest & { event?: any }, res: Response) {
  try {
    await query('DELETE FROM registrations WHERE event_id=$1 AND user_id=$2', [req.event.event_id, req.user!.userId]);
    res.json({ message: 'Unregistered' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAttendees(req: Request & { event?: any }, res: Response) {
  try {
    const { rows } = await query(
      `SELECT u.user_id, u.name, u.email, u.avatar_url, r.role, r.registered_at, r.team_name, r.team_members
       FROM registrations r JOIN users u ON r.user_id = u.user_id WHERE r.event_id=$1 ORDER BY r.registered_at`,
      [req.event.event_id]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
