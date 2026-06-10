import { pool, query } from './config/db';
import { v4 as uuidv4 } from 'uuid';

const TARGET_EMAIL = 'sixiibrahimov217@gmail.com';

// Badges to give the target account across finished events.
const BADGES: { type: string; label?: string }[] = [
  { type: 'winner' },
  { type: 'runner_up' },
  { type: 'best_pitch', label: 'Best Pitch' },
  { type: 'finalist' },
  { type: 'best_design', label: 'Best UI/UX' },
  { type: 'special', label: 'Community Hero' },
  { type: 'participant' },
];

async function run() {
  const { rows: u } = await query('SELECT user_id FROM users WHERE email=$1', [TARGET_EMAIL]);
  if (!u.length) { console.error(`User ${TARGET_EMAIL} not found.`); process.exit(1); }
  const userId = u[0].user_id;
  console.log(`✓ Target user: ${userId}`);

  // Finished events to populate history + badges (any event works as awarder=self since user owns them)
  const { rows: events } = await query(
    `SELECT event_id, title, type, status, created_by FROM events
     WHERE status IN ('finished','published')
     ORDER BY date DESC NULLS LAST`
  );
  if (!events.length) { console.error('No events found. Run seed first.'); process.exit(1); }

  let regCount = 0;
  for (const ev of events) {
    try {
      await query(
        `INSERT INTO registrations (registration_id, event_id, user_id, role, status, registered_at)
         VALUES ($1,$2,$3,'attendee',$4,NOW())
         ON CONFLICT (event_id, user_id) DO NOTHING`,
        [uuidv4(), ev.event_id, userId, ev.access_type === 'approval' ? 'approved' : null]
      );
      regCount++;
    } catch (e: any) {
      // status column may not allow null on some schemas — retry without it
      try {
        await query(
          `INSERT INTO registrations (registration_id, event_id, user_id, role, registered_at)
           VALUES ($1,$2,$3,'attendee',NOW())
           ON CONFLICT (event_id, user_id) DO NOTHING`,
          [uuidv4(), ev.event_id, userId]
        );
        regCount++;
      } catch {}
    }
  }
  console.log(`✓ Registered target into ${regCount} events`);

  // Clear previous fake badges for this user, then award fresh ones.
  await query('DELETE FROM achievements WHERE user_id=$1', [userId]);

  const finished = events.filter((e: any) => e.status === 'finished');
  const pool2 = finished.length ? finished : events;
  let awarded = 0;
  for (let i = 0; i < BADGES.length && i < pool2.length; i++) {
    const ev = pool2[i];
    try {
      await query(
        `INSERT INTO achievements (achievement_id, event_id, user_id, type, label, awarded_by)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [uuidv4(), ev.event_id, userId, BADGES[i].type, BADGES[i].label || null, ev.created_by || userId]
      );
      awarded++;
      console.log(`  🏅 ${BADGES[i].label || BADGES[i].type} — ${ev.title}`);
    } catch (e: any) {
      console.error(`  ✗ ${ev.title}: ${e.message}`);
    }
  }
  console.log(`✓ Awarded ${awarded} badges`);

  console.log('\n✅ Owner fake data complete!');
  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
