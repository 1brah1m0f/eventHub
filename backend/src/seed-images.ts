import { pool, query } from './config/db';

// Unsplash direct CDN — stable photo IDs for tech/conference/hackathon events
const EVENT_IMAGES: Record<string, string[]> = {
  'TechHack Baku 2024': [
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb6e0b8e3559?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  ],
  'AI Summit Azerbaijan 2024': [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582653291997-079a1c04e0a1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1559136555-9303baea8eae?auto=format&fit=crop&w=1200&q=80',
  ],
  'Flutter & Dart Workshop': [
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  ],
  'Startup Demo Day Baku': [
    'https://images.unsplash.com/photo-1560439513-74ec6e0e3a1b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1528901166007-3784c7dd3374?auto=format&fit=crop&w=1200&q=80',
  ],
  'DevMeetup Baku #12': [
    'https://images.unsplash.com/photo-1528901166007-3784c7dd3374?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505373877941-0eab70df5bdd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80',
  ],
  'Web3 & Blockchain Bootcamp': [
    'https://images.unsplash.com/photo-1517245386807-bb6e0b8e3559?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  ],
  'DataFest Baku 2025': [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1559136555-9303baea8eae?auto=format&fit=crop&w=1200&q=80',
  ],
  'UX & Product Design Workshop': [
    'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=1200&q=80',
  ],
  'CloudFest Baku 2025': [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582653291997-079a1c04e0a1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  ],
  'HackBaku 2025': [
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb6e0b8e3559?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1528901166007-3784c7dd3374?auto=format&fit=crop&w=1200&q=80',
  ],
};

async function run() {
  console.log('Adding images to events...');
  for (const [title, images] of Object.entries(EVENT_IMAGES)) {
    const { rowCount } = await query(
      `UPDATE events SET images = $1, cover_image = $2 WHERE title = $3`,
      [JSON.stringify(images), images[0], title]
    );
    console.log(`${rowCount ? '✓' : '✗'} ${title}`);
  }
  console.log('Done.');
  await pool.end();
}

run().catch(e => { console.error(e); process.exit(1); });
