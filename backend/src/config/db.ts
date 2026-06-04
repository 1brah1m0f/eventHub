import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const allowSelfSigned =
  process.env.DB_SSL_ALLOW_SELF_SIGNED === 'true' || process.env.NODE_ENV === 'development';
if (allowSelfSigned) {
  // Test/dev only: allow self-signed DB certificates.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const connectionString = process.env.DATABASE_URL?.replace(/[?&]sslmode=[^&]*/g, '');

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export async function query(text: string, params?: any[]) {
  const res = await pool.query(text, params);
  return res;
}
