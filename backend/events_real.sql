-- Replace all events with real Baku tech events. Run in Supabase SQL Editor.
BEGIN;

UPDATE events SET
  title='DevFest Baku 2024', type='conference', description='The biggest developer event of Azerbaijan, organized by GDG Baku. 300+ participants, 3 parallel tracks and 15 speakers covering web, mobile, AI/ML and cloud.',
  location='ADA University, Baku', date='2024-10-12T09:00:00Z', end_date='2024-10-12T18:00:00Z',
  status='finished', cover_image='https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='cf05f356-3af5-4ec8-811f-b74c8ca20541';

UPDATE events SET
  title='INMerge Innovation Summit 2024', type='summit', description='Eurasia’s flagship innovation summit organized by PASHA Holding. Two days of keynotes and panels on fintech, AI, telecom, e-commerce and Industry 4.0.',
  location='Baku Convention Center', date='2024-10-10T09:00:00Z', end_date='2024-10-11T18:00:00Z',
  status='finished', cover_image='https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='e7b52ea6-4cb4-4d74-90bc-3902a1152bcd';

UPDATE events SET
  title='Sustainable Development Hackathon', type='hackathon', description='Hackathon co-organized by Azercell and Eventify to unlock young people’s potential and build environmentally focused technologies.',
  location='Oxbridge Academy, Baku', date='2025-01-18T09:00:00Z', end_date='2025-01-19T17:00:00Z',
  status='finished', cover_image='https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='45772d6c-8a18-4077-af7c-1fccf597f299';

UPDATE events SET
  title='JunctionX Baku 2024', type='hackathon', description='One of Azerbaijan’s largest hackathons, hosted at UFAZ. Theme: “Artificial Intelligence in the Green Economy”, supported by the Education Development Foundation.',
  location='UFAZ, Baku', date='2024-11-23T09:00:00Z', end_date='2024-11-24T18:00:00Z',
  status='finished', cover_image='https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='d3aa3d98-6746-4f46-a50d-3b5f0363680c';

UPDATE events SET
  title='Holberton Vibe Hack-a-thon', type='hackathon', description='Weekend hackathon by GDG Baku and Holberton School Azerbaijan. Code, create and connect with fellow innovators, with mentors on site.',
  location='Holberton School Azerbaijan, Baku', date='2025-03-15T09:00:00Z', end_date='2025-03-16T18:00:00Z',
  status='finished', cover_image='https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='3eb8d26b-b0ef-4d1b-b31c-c13225736ede';

UPDATE events SET
  title='Build with AI Hackathon', type='hackathon', description='AI hackathon by GDG Baku with Holberton School Azerbaijan and Tedspace, powered by the Innovation and Digital Development Agency (IDDA).',
  location='Holberton School Azerbaijan, Baku', date='2025-04-26T09:00:00Z', end_date='2025-04-27T18:00:00Z',
  status='finished', cover_image='https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='a07efd17-977c-42c4-9801-6a462e012cc4';

UPDATE events SET
  title='Hack4World Baku', type='hackathon', description='Global DigiEduHack challenge held in Baku — teams tackle real-world education and sustainability problems over an intensive weekend.',
  location='Baku, Azerbaijan', date='2024-11-09T09:00:00Z', end_date='2024-11-10T18:00:00Z',
  status='finished', cover_image='https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='88ac3057-1990-49eb-943d-ae6c454c69d3';

UPDATE events SET
  title='IDDA Digital Hackathon 1.0', type='hackathon', description='First edition of the Innovation and Digital Development Agency hackathon — digital solutions for public services and e-government.',
  location='Innovation Hub, Baku', date='2024-12-07T09:00:00Z', end_date='2024-12-08T18:00:00Z',
  status='finished', cover_image='https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='b257f984-e513-40fa-ae02-eaba87ef5605';

UPDATE events SET
  title='BHOS Hackathon 2025 (SOCAR)', type='hackathon', description='SOCAR-backed hackathon at Baku Higher Oil School for new solutions in artificial intelligence and data engineering.',
  location='Baku Higher Oil School (BHOS)', date='2025-12-13T09:00:00Z', end_date='2025-12-14T18:00:00Z',
  status='published', cover_image='https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='e0000001-0000-0000-0000-000000000001';

UPDATE events SET
  title='INMerge Innovation Summit 2025', type='summit', description='PASHA Holding’s INMerge returns to Baku. Two days of keynotes, panels and workshops on AI, fintech, investment and digital transformation.',
  location='Baku Convention Center', date='2025-09-29T09:00:00Z', end_date='2025-09-30T18:00:00Z',
  status='published', cover_image='https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='e0000001-0000-0000-0000-000000000002';

UPDATE events SET
  title='DevFest Baku 2025', type='conference', description='GDG Baku’s flagship developer conference. 350+ participants, 20 speakers across 3 tracks on web, mobile, AI/ML, backend and frontend.',
  location='ADA University, Baku', date='2025-11-22T09:00:00Z', end_date='2025-11-22T18:00:00Z',
  status='published', cover_image='https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='e0000001-0000-0000-0000-000000000003';

UPDATE events SET
  title='Micro SaaS Hackathon', type='competition', description='48-hour build challenge by GDG Baku, Holberton School Azerbaijan and GoUP. Teams ship a micro-SaaS product and pitch it to a jury.',
  location='Holberton School Azerbaijan, Baku', date='2025-09-13T09:00:00Z', end_date='2025-09-14T18:00:00Z',
  status='published', cover_image='https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='e0000001-0000-0000-0000-000000000005';

UPDATE events SET
  title='Gamesummit Baku', type='summit', description='Azerbaijan’s gaming festival blending games with cosplay, music shows, AI and emerging technologies on the Caspian shore.',
  location='Sea Breeze Resort, Baku', date='2026-06-06T10:00:00Z', end_date='2026-06-08T20:00:00Z',
  status='published', cover_image='https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='e0000001-0000-0000-0000-000000000006';

UPDATE events SET
  title='Gənc Vizyon Ideyathon', type='hackathon', description='Youth idea-thon for students and young innovators. Teams shape digital product ideas into prototypes and pitch them to mentors and a jury.',
  location='Holberton School Azerbaijan, Baku', date='2026-04-18T09:00:00Z', end_date='2026-04-19T18:00:00Z',
  status='published', cover_image='https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='e0000001-0000-0000-0000-000000000007';

UPDATE events SET
  title='INNOSTART Innovation Camp', type='competition', description='IDDA’s regional innovation program bringing hackathons and startup bootcamps to communities across Azerbaijan.',
  location='Baku, Azerbaijan', date='2026-03-21T10:00:00Z', end_date='2026-03-22T17:00:00Z',
  status='published', cover_image='https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='e0000001-0000-0000-0000-000000000008';

UPDATE events SET
  title='IDDA Digital Hackathon 2.0', type='hackathon', description='Second edition of the Innovation and Digital Development Agency hackathon — AI, govtech and data-driven public services.',
  location='Innovation Hub, Baku', date='2026-05-16T09:00:00Z', end_date='2026-05-17T18:00:00Z',
  status='published', cover_image='https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='e0000001-0000-0000-0000-000000000009';

UPDATE events SET
  title='PASHA Startup Demo Day', type='demo_day', description='Demo day for the latest accelerator cohort. Startups pitch to investors, with audience voting for People’s Choice.',
  location='PASHA Holding Conference Center, Baku', date='2026-02-28T14:00:00Z', end_date='2026-02-28T19:00:00Z',
  status='published', cover_image='https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='e0000001-0000-0000-0000-000000000004';

UPDATE events SET
  title='Azercell Data & AI Conference', type='conference', description='Telecom-led conference on data engineering, real-time analytics, MLOps and applied AI in production.',
  location='JW Marriott Absheron, Baku', date='2026-08-14T09:00:00Z', end_date='2026-08-15T18:00:00Z',
  status='published', cover_image='https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='9eb569d3-a751-4a9e-b1f0-88e36843c064';

UPDATE events SET
  title='Kapital Bank FinTech Hackathon 2026', type='hackathon', description='36-hour fintech hackathon. Themes: payments, open banking and AI-driven financial products. Open to all experience levels.',
  location='ASAN Service Center, Baku', date='2026-10-03T09:00:00Z', end_date='2026-10-05T15:00:00Z',
  status='published', cover_image='https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80', updated_at=NOW()
WHERE event_id='4b246cf1-d695-489d-a1b3-c5517e91d3a9';

-- Delete every other (junk/test) event
DELETE FROM events WHERE event_id NOT IN (
  'cf05f356-3af5-4ec8-811f-b74c8ca20541',
  'e7b52ea6-4cb4-4d74-90bc-3902a1152bcd',
  '45772d6c-8a18-4077-af7c-1fccf597f299',
  'd3aa3d98-6746-4f46-a50d-3b5f0363680c',
  '3eb8d26b-b0ef-4d1b-b31c-c13225736ede',
  'a07efd17-977c-42c4-9801-6a462e012cc4',
  '88ac3057-1990-49eb-943d-ae6c454c69d3',
  'b257f984-e513-40fa-ae02-eaba87ef5605',
  'e0000001-0000-0000-0000-000000000001',
  'e0000001-0000-0000-0000-000000000002',
  'e0000001-0000-0000-0000-000000000003',
  'e0000001-0000-0000-0000-000000000005',
  'e0000001-0000-0000-0000-000000000006',
  'e0000001-0000-0000-0000-000000000007',
  'e0000001-0000-0000-0000-000000000008',
  'e0000001-0000-0000-0000-000000000009',
  'e0000001-0000-0000-0000-000000000004',
  '9eb569d3-a751-4a9e-b1f0-88e36843c064',
  '4b246cf1-d695-489d-a1b3-c5517e91d3a9'
);

COMMIT;
