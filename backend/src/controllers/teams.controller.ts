import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export async function createTeam(req: AuthRequest & { event?: any }, res: Response) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });

    const { rows } = await query(
      'INSERT INTO teams (team_id, event_id, name, member_ids) VALUES ($1,$2,$3,$4) RETURNING *',
      [uuidv4(), req.event.event_id, name, [req.user!.userId]]
    );
    res.status(201).json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getTeams(req: Request & { event?: any }, res: Response) {
  try {
    const { rows } = await query('SELECT * FROM teams WHERE event_id=$1', [req.event.event_id]);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function joinTeam(req: AuthRequest & { event?: any }, res: Response) {
  try {
    const { teamId } = req.params;
    const { rows } = await query('SELECT * FROM teams WHERE team_id=$1 AND event_id=$2', [teamId, req.event.event_id]);
    if (!rows.length) return res.status(404).json({ error: 'Team not found' });

    const team = rows[0];
    if (team.member_ids?.includes(req.user!.userId)) {
      return res.status(409).json({ error: 'Already in team' });
    }

    const updated = [...(team.member_ids || []), req.user!.userId];
    const { rows: result } = await query(
      'UPDATE teams SET member_ids=$1 WHERE team_id=$2 RETURNING *',
      [updated, teamId]
    );
    res.json(result[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function leaveTeam(req: AuthRequest & { event?: any }, res: Response) {
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
