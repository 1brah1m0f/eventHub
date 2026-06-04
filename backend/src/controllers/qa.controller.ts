import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export async function getQuestions(req: Request & { event?: any }, res: Response) {
  try {
    const { filter } = req.query; // 'answered' | 'unanswered'
    let sql = `SELECT q.*, u.name as asker_name, u.avatar_url as asker_avatar,
               (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.question_id) as answer_count
               FROM questions q LEFT JOIN users u ON q.asked_by = u.user_id
               WHERE q.event_id=$1`;
    const params: any[] = [req.event.event_id];

    if (filter === 'answered') sql += ' AND q.is_answered=true';
    if (filter === 'unanswered') sql += ' AND q.is_answered=false';

    sql += ' ORDER BY q.upvotes DESC, q.created_at DESC';
    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function postQuestion(req: AuthRequest & { event?: any }, res: Response) {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'content required' });

    // Must be registered for event
    const reg = await query(
      'SELECT 1 FROM registrations WHERE event_id=$1 AND user_id=$2',
      [req.event.event_id, req.user!.userId]
    );
    if (!reg.rows.length) return res.status(403).json({ error: 'Must be registered to ask questions' });

    const { rows } = await query(
      'INSERT INTO questions (question_id, event_id, asked_by, content) VALUES ($1,$2,$3,$4) RETURNING *',
      [uuidv4(), req.event.event_id, req.user!.userId, content.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function upvoteQuestion(req: AuthRequest, res: Response) {
  try {
    const { questionId } = req.params;
    const { rows } = await query('SELECT * FROM questions WHERE question_id=$1', [questionId]);
    if (!rows.length) return res.status(404).json({ error: 'Question not found' });

    const upvotedBy: string[] = rows[0].upvoted_by || [];
    const userId = req.user!.userId;

    if (upvotedBy.includes(userId)) {
      // Toggle off
      const updated = upvotedBy.filter(id => id !== userId);
      await query('UPDATE questions SET upvotes=$1, upvoted_by=$2 WHERE question_id=$3', [updated.length, updated, questionId]);
      return res.json({ upvoted: false, upvotes: updated.length });
    }

    const updated = [...upvotedBy, userId];
    await query('UPDATE questions SET upvotes=$1, upvoted_by=$2 WHERE question_id=$3', [updated.length, updated, questionId]);
    res.json({ upvoted: true, upvotes: updated.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAnswers(req: Request, res: Response) {
  try {
    const { questionId } = req.params;
    const { rows } = await query(
      `SELECT a.*, u.name as answerer_name, u.avatar_url as answerer_avatar
       FROM answers a LEFT JOIN users u ON a.answered_by = u.user_id
       WHERE a.question_id=$1 ORDER BY a.created_at`,
      [questionId]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function postAnswer(req: AuthRequest & { event?: any; eventRole?: string }, res: Response) {
  try {
    const { questionId } = req.params;
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'content required' });

    // Only owner, staff, or mentors can answer
    const userId = req.user!.userId;
    const isOwnerOrStaff = ['owner', 'staff'].includes(req.eventRole!);

    let canAnswer = isOwnerOrStaff;
    if (!canAnswer) {
      const mentor = await query(
        "SELECT 1 FROM registrations WHERE event_id=$1 AND user_id=$2 AND role='mentor'",
        [req.event.event_id, userId]
      );
      canAnswer = mentor.rows.length > 0;
    }

    if (!canAnswer) return res.status(403).json({ error: 'Only owner, staff, or mentors can answer' });

    const { rows } = await query(
      'INSERT INTO answers (answer_id, question_id, answered_by, content) VALUES ($1,$2,$3,$4) RETURNING *',
      [uuidv4(), questionId, userId, content.trim()]
    );

    // Mark question as answered
    await query('UPDATE questions SET is_answered=true WHERE question_id=$1', [questionId]);
    res.status(201).json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
