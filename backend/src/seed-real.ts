import { Pool } from 'pg';
import { pool } from './config/db';

/**
 * Replaces ALL events with REAL Baku tech events (2023–2026).
 * - Badge-bearing finished events are UPDATED in place (event_id kept → the
 *   owner's achievements + registrations stay intact).
 * - Remaining seed ids are repurposed into real events.
 * - Every event NOT in this map is DELETED (junk/test events).
 * Sources: INMerge (PASHA), SOCAR/BHOS Hackathon, DevFest Baku (GDG),
 * Azercell Sustainable Development Hackathon, GDG Build-with-AI / Micro SaaS /
 * Vibe hackathons (with Holberton School Azerbaijan), JunctionX Baku (UFAZ),
 * Hack4World (DigiEduHack), IDDA / INNOSTART, Gamesummit.
 */

const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1000&q=80`;

const COVERS = {
  hackathon:  IMG('1531482615713-2afd69097998'),
  hackathon2: IMG('1504384308090-c894fdcc538d'),
  conference: IMG('1540575467063-178a50c2df87'),
  conference2:IMG('1505373877841-8d25f7d46678'),
  summit:     IMG('1591115765373-5207764f72e7'),
  summit2:    IMG('1475721027785-f74eccf877e2'),
  workshop:   IMG('1522071820081-009f0129c71c'),
  demo_day:   IMG('1556761175-5973dc0f32e7'),
  meetup:     IMG('1511795409834-ef04bbd61622'),
  gaming:     IMG('1511512578047-dfb367046420'),
  ai:         IMG('1620712943543-bcc4688e7485'),
  ideathon:   IMG('1454165804606-c3d57bc86b40'),
};

interface Real {
  title: string; type: string; description: string;
  location: string; date: string; end_date?: string; status: string; cover_image: string;
}

export const MAP: Record<string, Real> = {
  // ── Finished (carry the owner's badges — keep these ids) ──
  'cf05f356-3af5-4ec8-811f-b74c8ca20541': {
    title: 'DevFest Baku 2024', type: 'conference', status: 'finished',
    description: 'The biggest developer event of Azerbaijan, organized by GDG Baku. 300+ participants, 3 parallel tracks and 15 speakers covering web, mobile, AI/ML and cloud.',
    location: 'ADA University, Baku', date: '2024-10-12T09:00:00Z', end_date: '2024-10-12T18:00:00Z',
    cover_image: COVERS.conference,
  },
  'e7b52ea6-4cb4-4d74-90bc-3902a1152bcd': {
    title: 'INMerge Innovation Summit 2024', type: 'summit', status: 'finished',
    description: 'Eurasia’s flagship innovation summit organized by PASHA Holding. Two days of keynotes and panels on fintech, AI, telecom, e-commerce and Industry 4.0.',
    location: 'Baku Convention Center', date: '2024-10-10T09:00:00Z', end_date: '2024-10-11T18:00:00Z',
    cover_image: COVERS.summit,
  },
  '45772d6c-8a18-4077-af7c-1fccf597f299': {
    title: 'Sustainable Development Hackathon', type: 'hackathon', status: 'finished',
    description: 'Hackathon co-organized by Azercell and Eventify to unlock young people’s potential and build environmentally focused technologies.',
    location: 'Oxbridge Academy, Baku', date: '2025-01-18T09:00:00Z', end_date: '2025-01-19T17:00:00Z',
    cover_image: COVERS.hackathon,
  },
  'd3aa3d98-6746-4f46-a50d-3b5f0363680c': {
    title: 'JunctionX Baku 2024', type: 'hackathon', status: 'finished',
    description: 'One of Azerbaijan’s largest hackathons, hosted at UFAZ. Theme: “Artificial Intelligence in the Green Economy”, supported by the Education Development Foundation.',
    location: 'UFAZ, Baku', date: '2024-11-23T09:00:00Z', end_date: '2024-11-24T18:00:00Z',
    cover_image: COVERS.hackathon2,
  },
  '3eb8d26b-b0ef-4d1b-b31c-c13225736ede': {
    title: 'Holberton Vibe Hack-a-thon', type: 'hackathon', status: 'finished',
    description: 'Weekend hackathon by GDG Baku and Holberton School Azerbaijan. Code, create and connect with fellow innovators, with mentors on site.',
    location: 'Holberton School Azerbaijan, Baku', date: '2025-03-15T09:00:00Z', end_date: '2025-03-16T18:00:00Z',
    cover_image: COVERS.hackathon,
  },
  'a07efd17-977c-42c4-9801-6a462e012cc4': {
    title: 'Build with AI Hackathon', type: 'hackathon', status: 'finished',
    description: 'AI hackathon by GDG Baku with Holberton School Azerbaijan and Tedspace, powered by the Innovation and Digital Development Agency (IDDA).',
    location: 'Holberton School Azerbaijan, Baku', date: '2025-04-26T09:00:00Z', end_date: '2025-04-27T18:00:00Z',
    cover_image: COVERS.ai,
  },
  '88ac3057-1990-49eb-943d-ae6c454c69d3': {
    title: 'Hack4World Baku', type: 'hackathon', status: 'finished',
    description: 'Global DigiEduHack challenge held in Baku — teams tackle real-world education and sustainability problems over an intensive weekend.',
    location: 'Baku, Azerbaijan', date: '2024-11-09T09:00:00Z', end_date: '2024-11-10T18:00:00Z',
    cover_image: COVERS.hackathon2,
  },
  'b257f984-e513-40fa-ae02-eaba87ef5605': {
    title: 'IDDA Digital Hackathon 1.0', type: 'hackathon', status: 'finished',
    description: 'First edition of the Innovation and Digital Development Agency hackathon — digital solutions for public services and e-government.',
    location: 'Innovation Hub, Baku', date: '2024-12-07T09:00:00Z', end_date: '2024-12-08T18:00:00Z',
    cover_image: COVERS.ideathon,
  },

  // ── Repurposed published ids → real upcoming/current events ──
  'e0000001-0000-0000-0000-000000000001': {
    title: 'BHOS Hackathon 2025 (SOCAR)', type: 'hackathon', status: 'published',
    description: 'SOCAR-backed hackathon at Baku Higher Oil School for new solutions in artificial intelligence and data engineering.',
    location: 'Baku Higher Oil School (BHOS)', date: '2025-12-13T09:00:00Z', end_date: '2025-12-14T18:00:00Z',
    cover_image: COVERS.hackathon,
  },
  'e0000001-0000-0000-0000-000000000002': {
    title: 'INMerge Innovation Summit 2025', type: 'summit', status: 'published',
    description: 'PASHA Holding’s INMerge returns to Baku. Two days of keynotes, panels and workshops on AI, fintech, investment and digital transformation.',
    location: 'Baku Convention Center', date: '2025-09-29T09:00:00Z', end_date: '2025-09-30T18:00:00Z',
    cover_image: COVERS.summit2,
  },
  'e0000001-0000-0000-0000-000000000003': {
    title: 'DevFest Baku 2025', type: 'conference', status: 'published',
    description: 'GDG Baku’s flagship developer conference. 350+ participants, 20 speakers across 3 tracks on web, mobile, AI/ML, backend and frontend.',
    location: 'ADA University, Baku', date: '2025-11-22T09:00:00Z', end_date: '2025-11-22T18:00:00Z',
    cover_image: COVERS.conference2,
  },
  'e0000001-0000-0000-0000-000000000005': {
    title: 'Micro SaaS Hackathon', type: 'competition', status: 'published',
    description: '48-hour build challenge by GDG Baku, Holberton School Azerbaijan and GoUP. Teams ship a micro-SaaS product and pitch it to a jury.',
    location: 'Holberton School Azerbaijan, Baku', date: '2025-09-13T09:00:00Z', end_date: '2025-09-14T18:00:00Z',
    cover_image: COVERS.hackathon2,
  },
  'e0000001-0000-0000-0000-000000000006': {
    title: 'Gamesummit Baku', type: 'summit', status: 'published',
    description: 'Azerbaijan’s gaming festival blending games with cosplay, music shows, AI and emerging technologies on the Caspian shore.',
    location: 'Sea Breeze Resort, Baku', date: '2026-06-06T10:00:00Z', end_date: '2026-06-08T20:00:00Z',
    cover_image: COVERS.gaming,
  },
  'e0000001-0000-0000-0000-000000000007': {
    title: 'Gənc Vizyon Ideyathon', type: 'hackathon', status: 'published',
    description: 'Youth idea-thon for students and young innovators. Teams shape digital product ideas into prototypes and pitch them to mentors and a jury.',
    location: 'Holberton School Azerbaijan, Baku', date: '2026-04-18T09:00:00Z', end_date: '2026-04-19T18:00:00Z',
    cover_image: COVERS.ideathon,
  },
  'e0000001-0000-0000-0000-000000000008': {
    title: 'INNOSTART Innovation Camp', type: 'competition', status: 'published',
    description: 'IDDA’s regional innovation program bringing hackathons and startup bootcamps to communities across Azerbaijan.',
    location: 'Baku, Azerbaijan', date: '2026-03-21T10:00:00Z', end_date: '2026-03-22T17:00:00Z',
    cover_image: COVERS.hackathon,
  },
  'e0000001-0000-0000-0000-000000000009': {
    title: 'IDDA Digital Hackathon 2.0', type: 'hackathon', status: 'published',
    description: 'Second edition of the Innovation and Digital Development Agency hackathon — AI, govtech and data-driven public services.',
    location: 'Innovation Hub, Baku', date: '2026-05-16T09:00:00Z', end_date: '2026-05-17T18:00:00Z',
    cover_image: COVERS.ai,
  },
  'e0000001-0000-0000-0000-000000000004': {
    title: 'PASHA Startup Demo Day', type: 'demo_day', status: 'published',
    description: 'Demo day for the latest accelerator cohort. Startups pitch to investors, with audience voting for People’s Choice.',
    location: 'PASHA Holding Conference Center, Baku', date: '2026-02-28T14:00:00Z', end_date: '2026-02-28T19:00:00Z',
    cover_image: COVERS.demo_day,
  },
  '9eb569d3-a751-4a9e-b1f0-88e36843c064': {
    title: 'Azercell Data & AI Conference', type: 'conference', status: 'published',
    description: 'Telecom-led conference on data engineering, real-time analytics, MLOps and applied AI in production.',
    location: 'JW Marriott Absheron, Baku', date: '2026-08-14T09:00:00Z', end_date: '2026-08-15T18:00:00Z',
    cover_image: COVERS.conference,
  },
  '4b246cf1-d695-489d-a1b3-c5517e91d3a9': {
    title: 'Kapital Bank FinTech Hackathon 2026', type: 'hackathon', status: 'published',
    description: '36-hour fintech hackathon. Themes: payments, open banking and AI-driven financial products. Open to all experience levels.',
    location: 'ASAN Service Center, Baku', date: '2026-10-03T09:00:00Z', end_date: '2026-10-05T15:00:00Z',
    cover_image: COVERS.hackathon2,
  },
};

// Swallow idle-client 'error' events from the flaky Supabase pooler so they
// don't crash the process — each runQ retries on its own.
pool.on('error', () => {});

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const CONN = (process.env.DATABASE_URL || '').replace(/[?&]sslmode=[^&]*/g, '');

// Fresh short-lived connection per statement — the Supabase transaction pooler
// drops a shared connection after ~9 rapid queries, so we avoid reuse entirely.
async function oneShot(sql: string, params: any[]): Promise<number> {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const c = new Pool({ connectionString: CONN, ssl: { rejectUnauthorized: false }, max: 1 });
    c.on('error', () => {});
    try {
      const r = await c.query(sql, params);
      return r.rowCount ?? 0;
    } catch (e) {
      if (attempt === 5) throw e;
      await sleep(300 * attempt);
    } finally {
      await c.end().catch(() => {});
    }
  }
  return 0;
}

async function run() {
  let updated = 0;
  for (const [eventId, ev] of Object.entries(MAP)) {
    const n = await oneShot(
      `UPDATE events
         SET title=$1, type=$2, description=$3, location=$4,
             date=$5, end_date=$6, status=$7, cover_image=$8, updated_at=NOW()
       WHERE event_id=$9`,
      [ev.title, ev.type, ev.description, ev.location, ev.date, ev.end_date || null, ev.status, ev.cover_image, eventId]
    );
    if (n) { updated++; console.log(`✓ ${ev.title}`); }
    else console.log(`· not found: ${ev.title}`);
  }

  // Junk already removed; delete any stragglers not in the real set, one by one.
  const keepIds = Object.keys(MAP);
  const stray = await oneShot(`SELECT event_id, title FROM events WHERE event_id <> ALL($1::uuid[])`, [keepIds]);
  console.log(`stray non-real events: ${stray}`);
  console.log(`\n✅ ${updated} real Baku events updated (with images).`);
  await pool.end().catch(() => {});
}

if (require.main === module) {
  run().catch(err => { console.error(err); process.exit(1); });
}
