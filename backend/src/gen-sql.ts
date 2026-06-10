import { writeFileSync } from 'fs';
import { join } from 'path';
import { MAP } from './seed-real';

const q = (s: string | null | undefined) =>
  s == null ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`;

const ids = Object.keys(MAP);
let sql = '-- Replace all events with real Baku tech events. Run in Supabase SQL Editor.\nBEGIN;\n\n';

for (const [id, ev] of Object.entries(MAP)) {
  sql += `UPDATE events SET
  title=${q(ev.title)}, type=${q(ev.type)}, description=${q(ev.description)},
  location=${q(ev.location)}, date=${q(ev.date)}, end_date=${q(ev.end_date)},
  status=${q(ev.status)}, cover_image=${q(ev.cover_image)}, updated_at=NOW()
WHERE event_id='${id}';\n\n`;
}

sql += `-- Delete every other (junk/test) event\n`;
sql += `DELETE FROM events WHERE event_id NOT IN (\n  ${ids.map(i => `'${i}'`).join(',\n  ')}\n);\n\n`;
sql += 'COMMIT;\n';

const out = join(__dirname, '..', 'events_real.sql');
writeFileSync(out, sql, 'utf8');
console.log('Wrote', out, `(${ids.length} updates + delete)`);
