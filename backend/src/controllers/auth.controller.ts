import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import { sendOtpEmail } from '../services/email.service';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendCode(req: Request, res: Response) {
  try {
    const { email, purpose = 'login' } = req.body;
    if (!email || !['login', 'password_reset'].includes(purpose)) {
      return res.status(400).json({ error: 'email and valid purpose required' });
    }

    const normalized = normalizeEmail(email);
    const { rows: users } = await query('SELECT user_id FROM users WHERE email=$1', [normalized]);
    if (!users.length) {
      return res.status(404).json({ error: 'Bu e-poçt ilə hesab tapılmadı' });
    }

    const { rows: recent } = await query(
      `SELECT id FROM auth_codes
       WHERE email=$1 AND used_at IS NULL AND created_at > NOW() - INTERVAL '60 seconds'`,
      [normalized],
    );
    if (recent.length) {
      return res.status(429).json({ error: 'Yeni kod üçün 60 saniyə gözləyin' });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await query(
      'INSERT INTO auth_codes (email, code, purpose, expires_at) VALUES ($1,$2,$3,$4)',
      [normalized, code, purpose, expiresAt],
    );

    await sendOtpEmail(normalized, code, purpose);
    res.json({ message: 'Kod e-poçtunuza göndərildi' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function verifyCode(req: Request, res: Response) {
  try {
    const { email, code, purpose = 'login', newPassword } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'email and code required' });
    }

    const normalized = normalizeEmail(email);
    const { rows: codes } = await query(
      `SELECT id FROM auth_codes
       WHERE email=$1 AND code=$2 AND purpose=$3
         AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [normalized, String(code).trim(), purpose],
    );
    if (!codes.length) {
      return res.status(401).json({ error: 'Kod yanlışdır və ya vaxtı bitib' });
    }

    await query('UPDATE auth_codes SET used_at=NOW() WHERE id=$1', [codes[0].id]);

    if (purpose === 'password_reset' && newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Şifrə ən azı 6 simvol olmalıdır' });
      }
      const hashed = await bcrypt.hash(newPassword, 12);
      await query('UPDATE users SET password=$1 WHERE email=$2', [hashed, normalized]);
    }

    const { rows } = await query('SELECT * FROM users WHERE email=$1', [normalized]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });

    const { password: _, ...user } = rows[0];
    const token = signToken(user.user_id, user.email);
    res.json({ user, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, bio, skills, linkedin_url } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, password required' });
    }

    const existing = await query('SELECT user_id FROM users WHERE email=$1', [email]);
    if (existing.rows.length) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const { rows } = await query(
      `INSERT INTO users (user_id, name, email, password, bio, skills, linkedin_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING user_id, name, email, bio, skills, linkedin_url, created_at`,
      [uuidv4(), name, email, hashed, bio || null, skills || null, linkedin_url || null]
    );

    const token = signToken(rows[0].user_id, rows[0].email);
    res.status(201).json({ user: rows[0], token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const skipPasswordCheck = process.env.DISABLE_LOGIN_PASSWORD_CHECK === 'true';
    if (!email || (!password && !skipPasswordCheck)) {
      return res.status(400).json({ error: 'email, password required' });
    }

    const { rows } = await query('SELECT * FROM users WHERE email=$1', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    if (!skipPasswordCheck) {
      const valid = await bcrypt.compare(password, rows[0].password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password: _, ...user } = rows[0];
    const token = signToken(user.user_id, user.email);
    res.json({ user, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function me(req: Request & { user?: any }, res: Response) {
  try {
    const { rows } = await query(
      'SELECT user_id, name, email, bio, skills, linkedin_url, x_url, instagram_url, avatar_url, created_at FROM users WHERE user_id=$1',
      [req.user!.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateProfile(req: Request & { user?: any }, res: Response) {
  try {
    const { name, bio, skills, linkedin_url, x_url, instagram_url, avatar_url } = req.body;
    const { rows } = await query(
      `UPDATE users SET
         name=COALESCE($1,name), bio=COALESCE($2,bio), skills=COALESCE($3,skills),
         linkedin_url=$4, x_url=$5, instagram_url=$6,
         avatar_url=COALESCE($7,avatar_url)
       WHERE user_id=$8
       RETURNING user_id, name, email, bio, skills, linkedin_url, x_url, instagram_url, avatar_url`,
      [name, bio, skills, linkedin_url ?? null, x_url ?? null, instagram_url ?? null, avatar_url, req.user!.userId]
    );
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function myEvents(req: Request & { user?: any }, res: Response) {
  try {
    const { rows } = await query(
      `SELECT e.*,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.event_id) as attendee_count
       FROM events e WHERE e.created_by=$1 ORDER BY e.created_at DESC`,
      [req.user!.userId]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function myRegistrations(req: Request & { user?: any }, res: Response) {
  try {
    const { rows } = await query(
      `SELECT e.*, reg.role as registration_role, reg.registered_at,
        u.name as owner_name,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.event_id) as attendee_count
       FROM registrations reg
       JOIN events e ON reg.event_id = e.event_id
       LEFT JOIN users u ON e.created_by = u.user_id
       WHERE reg.user_id=$1 ORDER BY e.date DESC`,
      [req.user!.userId]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function myStaffEvents(req: Request & { user?: any }, res: Response) {
  try {
    const { rows } = await query(
      `SELECT e.*, u.name as owner_name,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.event_id) as attendee_count
       FROM event_staff es
       JOIN events e ON es.event_id = e.event_id
       LEFT JOIN users u ON e.created_by = u.user_id
       WHERE es.user_id=$1 ORDER BY e.date DESC`,
      [req.user!.userId]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

function signToken(userId: string, email: string) {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}
