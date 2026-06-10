import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/events.routes';
import uploadRoute from './routes/upload.route';
import dashboardRoutes from './routes/dashboard.routes';
import teamRoutes from './routes/teams.routes';
import userRoutes from './routes/users.routes';
import { pool, query } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/upload', uploadRoute);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

async function ensureSchema() {
  // Achievements table is newer than the rest of the DB — guarantee it exists on boot.
  await query(`
    CREATE TABLE IF NOT EXISTS achievements (
      achievement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID REFERENCES events(event_id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
      type VARCHAR(40) NOT NULL DEFAULT 'participant',
      label VARCHAR(120),
      team_name VARCHAR(255),
      awarded_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await query('CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id)');
  await query('CREATE INDEX IF NOT EXISTS idx_achievements_event ON achievements(event_id)');
}

pool.connect()
  .then(async client => {
    client.release();
    console.log('DB connected');
    try { await ensureSchema(); console.log('Schema ensured'); }
    catch (e: any) { console.error('ensureSchema failed:', e.message); }
  })
  .catch(err => console.error('DB connection FAILED:', err.message));

app.listen(PORT, () => console.log(`Server running on :${PORT}`));
