import { pool, query } from './config/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const TARGET_EMAIL = 'sixiibrahimov217@gmail.com';

const FAKE_NAMES = [
  'Anar Məmmədov','Leyla Əliyeva','Orxan Hüseynov','Nigar Quliyeva','Rauf Babayev',
  'Sevinc Əhmədova','Tural Həsənov','Günel Nəcəfova','Elçin Rəsulов','Aytən Kərimova',
  'Vüsal Musayev','Könül İsmayılova','Fərid Abbasov','Nərmin Əsgərova','Cavid Sultanov',
  'Xədicə Qəhrəmanova','Murad Allahverdiyev','Şəbnəm Novruzova','Elnur Cəfərov','Lalə Piriyeva',
  'Kamran Bağırov','Zəhra Məhərrəmova','Samir Əlizadə','Arzu Həşimova','Emil Nağıyev',
  'Türkan Qasımova','Bəhruz Hüseynli','Samirə Babazadə','Rəşad Əliyev','Aysel Məmmədli',
  'Farid Ahmadov','Nadia Hasanova','Kanan Guliyev','Sabina Aliyeva','Namiq Rahimov',
  'Ulviya Mammadova','Taleh Huseynov','Firuza Qasimova','Ceyhun Nasirov','Zulfiya Ibrahimova',
  'Rahim Karimov','Seida Abbasli','Orkhan Mustafayev','Aida Valiyeva','Fuad Rzayev',
  'Nuray Alizada','Toghrul Mammadov','Kamala Guliyeva','Rashad Babayev','Laman Hajiyeva',
  'Elvin Salmanov','Malahat Qurbanova','Vugar Jafarov','Narmin Hasanli','Farhad Aliyev',
  'Gunel Mammadova','Nicat Huseynli','Zeynab Rzayeva','Murad Naghiyev','Aygun Musayeva',
  'Emin Babayev','Sevinj Aliyeva','Tarlan Karimov','Aysel Hasanova','Ilham Mammadov',
  'Kontantin Petrov','Alex Smirnov','Maria Kowalski','Jonas Weber','Sarah Connor',
  'David Kim','Yuki Tanaka','Omar Abdullah','Priya Sharma','Carlos Martinez',
  'Sophie Laurent','Max Müller','Anna Novak','Lucas Oliveira','Eva Johansson',
  'Mia Zhang','Noah Brown','Isabella Rossi','Liam Wilson','Emma Taylor',
];

const AGENDAS: Record<string, any[]> = {
  hackathon: [
    { time: '09:00', title: 'Registration & Check-in', description: 'Pick up your badge and kit' },
    { time: '10:00', title: 'Opening Ceremony', description: 'Welcome speech and rules briefing' },
    { time: '10:30', title: 'Hacking Begins', description: '24-hour coding marathon starts' },
    { time: '13:00', title: 'Lunch Break', description: 'Catered lunch for all participants' },
    { time: '15:00', title: 'Mentor Sessions', description: 'One-on-one with industry experts' },
    { time: '20:00', title: 'Dinner & Networking', description: 'Informal networking over dinner' },
    { time: '10:00+1', title: 'Project Submissions Due', description: 'Final code push deadline' },
    { time: '11:00+1', title: 'Demo Presentations', description: 'Each team presents for 5 minutes' },
    { time: '14:00+1', title: 'Judging & Awards', description: 'Winners announced, prizes distributed' },
  ],
  conference: [
    { time: '08:30', title: 'Registration & Coffee', description: 'Morning networking and registration' },
    { time: '09:30', title: 'Opening Keynote', description: 'Industry trends and vision for 2025' },
    { time: '10:30', title: 'Panel: Future of Tech', description: '5 industry leaders discuss the roadmap ahead' },
    { time: '12:00', title: 'Lunch Break', description: 'Buffet lunch and networking' },
    { time: '13:30', title: 'Track A: AI & ML', description: 'Deep dive into production ML systems' },
    { time: '13:30', title: 'Track B: Cloud & DevOps', description: 'Scaling infrastructure at startups' },
    { time: '15:30', title: 'Coffee Break & Expo', description: 'Visit sponsor booths and demo stations' },
    { time: '16:00', title: 'Lightning Talks', description: '8 speakers × 5 minutes each' },
    { time: '17:00', title: 'Closing Keynote & Awards', description: 'Wrap-up and community recognitions' },
  ],
  workshop: [
    { time: '10:00', title: 'Introduction & Setup', description: 'Environment setup and overview' },
    { time: '10:30', title: 'Module 1: Fundamentals', description: 'Core concepts and hands-on exercises' },
    { time: '12:00', title: 'Lunch Break', description: '1-hour break' },
    { time: '13:00', title: 'Module 2: Advanced Topics', description: 'Deep dive with live coding' },
    { time: '15:00', title: 'Project Work', description: 'Apply what you learned to a mini project' },
    { time: '16:30', title: 'Q&A and Wrap-up', description: 'Questions, feedback, and next steps' },
  ],
  meetup: [
    { time: '18:00', title: 'Doors Open & Networking', description: 'Grab a drink and meet fellow devs' },
    { time: '18:30', title: 'Talk 1', description: 'Community spotlight presentation' },
    { time: '19:00', title: 'Talk 2', description: 'Technical deep dive from the community' },
    { time: '19:30', title: 'Open Mic & Discussion', description: 'Share your projects and ideas' },
    { time: '20:00', title: 'Networking & Afterparty', description: 'Continue the conversation informally' },
  ],
  demo_day: [
    { time: '14:00', title: 'Welcome & Introductions', description: 'Meet the startups presenting today' },
    { time: '14:15', title: 'Demo Slot 1–3', description: 'First three startups pitch (5 min each)' },
    { time: '15:00', title: 'Demo Slot 4–6', description: 'Next three startups pitch' },
    { time: '15:45', title: 'Investor Panel Q&A', description: 'Investors ask the tough questions' },
    { time: '16:30', title: 'Networking Reception', description: 'Connect with founders and investors' },
    { time: '17:30', title: 'Awards Announcement', description: 'Best pitch, most innovative, audience favorite' },
  ],
  bootcamp: [
    { time: '09:00', title: 'Day 1: Kickoff', description: 'Curriculum overview and team assignments' },
    { time: '10:00', title: 'Lecture Block 1', description: 'Core technical foundations' },
    { time: '12:00', title: 'Lunch', description: '' },
    { time: '13:00', title: 'Lab Session', description: 'Hands-on practice with mentors' },
    { time: '15:30', title: 'Group Project Kickoff', description: 'Form teams and start building' },
    { time: '17:00', title: 'Daily Standup', description: 'Progress check and blockers' },
  ],
};

const EVENTS = [
  {
    title: 'TechHack Baku 2024',
    type: 'hackathon',
    description: '48-hour hackathon bringing together 200+ developers, designers, and entrepreneurs to build innovative solutions for Azerbaijan\'s digital future. Prizes worth ₼15,000 across 5 categories.',
    date: new Date('2024-06-15T09:00:00Z'),
    end_date: new Date('2024-06-17T18:00:00Z'),
    location: 'Baku Tech Hub, Nizami St. 54',
    status: 'finished',
    access_type: 'public',
    regCount: 58,
    regSpread: { start: new Date('2024-04-01'), end: new Date('2024-06-14') },
  },
  {
    title: 'AI Summit Azerbaijan 2024',
    type: 'conference',
    description: 'The region\'s premier AI conference featuring keynotes from Google, Microsoft, and local AI pioneers. Explore real-world applications of machine learning, LLMs, and computer vision.',
    date: new Date('2024-08-22T09:00:00Z'),
    end_date: new Date('2024-08-23T18:00:00Z'),
    location: 'JW Marriott Absheron Baku',
    status: 'finished',
    access_type: 'public',
    regCount: 75,
    regSpread: { start: new Date('2024-06-01'), end: new Date('2024-08-21') },
  },
  {
    title: 'Flutter & Dart Workshop',
    type: 'workshop',
    description: 'Full-day intensive workshop on building cross-platform mobile apps with Flutter. From zero to deploying your first app on both iOS and Android.',
    date: new Date('2024-10-05T10:00:00Z'),
    end_date: new Date('2024-10-05T17:00:00Z'),
    location: 'Ada University, Ahmadbay Aghaoglu 61',
    status: 'finished',
    access_type: 'public',
    regCount: 32,
    regSpread: { start: new Date('2024-08-15'), end: new Date('2024-10-04') },
  },
  {
    title: 'Startup Demo Day Baku',
    type: 'demo_day',
    description: 'Showcase of the top 10 startups from the latest Baku accelerator cohort. Pitch to investors, meet founders, and discover the next wave of Azerbaijani tech companies.',
    date: new Date('2024-11-28T14:00:00Z'),
    end_date: new Date('2024-11-28T19:00:00Z'),
    location: 'PASHA Holding Conference Center',
    status: 'finished',
    access_type: 'public',
    regCount: 44,
    regSpread: { start: new Date('2024-10-01'), end: new Date('2024-11-27') },
  },
  {
    title: 'DevMeetup Baku #12',
    type: 'meetup',
    description: 'Monthly developer meetup. January edition focuses on developer productivity tools, AI-assisted coding, and lessons learned from shipping in 2024.',
    date: new Date('2025-01-23T18:00:00Z'),
    end_date: new Date('2025-01-23T21:00:00Z'),
    location: 'Bravo Coworking, 28 May St.',
    status: 'finished',
    access_type: 'public',
    regCount: 28,
    regSpread: { start: new Date('2024-12-15'), end: new Date('2025-01-22') },
  },
  {
    title: 'Web3 & Blockchain Bootcamp',
    type: 'bootcamp',
    description: '3-day intensive bootcamp on Web3 development. Learn Solidity, deploy smart contracts on Ethereum, and build a decentralized application from scratch. No prior blockchain experience required.',
    date: new Date('2025-02-14T09:00:00Z'),
    end_date: new Date('2025-02-16T17:00:00Z'),
    location: 'Innovation Hub Baku, Heydar Aliyev Ave 103',
    status: 'finished',
    access_type: 'approval',
    regCount: 38,
    regSpread: { start: new Date('2025-01-01'), end: new Date('2025-02-13') },
  },
  {
    title: 'DataFest Baku 2025',
    type: 'conference',
    description: 'Two-day data conference for engineers, analysts, and scientists. Topics: data engineering at scale, real-time analytics, MLOps, vector databases, and the future of BI.',
    date: new Date('2025-03-21T09:00:00Z'),
    end_date: new Date('2025-03-22T18:00:00Z'),
    location: 'Baku Convention Center',
    status: 'finished',
    access_type: 'public',
    regCount: 79,
    regSpread: { start: new Date('2025-01-10'), end: new Date('2025-03-20') },
  },
  {
    title: 'UX & Product Design Workshop',
    type: 'workshop',
    description: 'Hands-on full-day workshop on user research, wireframing, and Figma prototyping. Taught by senior designers from leading Azerbaijani tech companies.',
    date: new Date('2025-05-10T10:00:00Z'),
    end_date: new Date('2025-05-10T17:00:00Z'),
    location: 'Online (Zoom)',
    status: 'finished',
    access_type: 'public',
    regCount: 26,
    regSpread: { start: new Date('2025-03-20'), end: new Date('2025-05-09') },
  },
  {
    title: 'CloudFest Baku 2025',
    type: 'conference',
    description: 'The biggest cloud computing event in the South Caucasus. AWS, Azure, and GCP engineers share case studies, architecture patterns, and cost-optimization strategies for 2025.',
    date: new Date('2025-08-14T09:00:00Z'),
    end_date: new Date('2025-08-15T18:00:00Z'),
    location: 'Hilton Baku',
    status: 'published',
    access_type: 'public',
    regCount: 47,
    regSpread: { start: new Date('2025-04-01'), end: new Date('2025-06-04') },
  },
  {
    title: 'HackBaku 2025',
    type: 'hackathon',
    description: 'Azerbaijan\'s largest hackathon returns. 36 hours, ₼20,000 in prizes, themes: FinTech, HealthTech, and GreenTech. Open to all experience levels.',
    date: new Date('2025-10-03T09:00:00Z'),
    end_date: new Date('2025-10-05T15:00:00Z'),
    location: 'ASAN Service Center, Baku',
    status: 'published',
    access_type: 'public',
    regCount: 22,
    regSpread: { start: new Date('2025-05-01'), end: new Date('2025-06-04') },
  },
];

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

async function seed() {
  console.log('🌱 Starting seed...');

  // Get target user
  const { rows: targetRows } = await query('SELECT user_id FROM users WHERE email = $1', [TARGET_EMAIL]);
  if (!targetRows.length) {
    console.error(`User ${TARGET_EMAIL} not found. Register first.`);
    process.exit(1);
  }
  const ownerId = targetRows[0].user_id;
  console.log(`✓ Owner: ${ownerId}`);

  // Create fake users
  const passwordHash = await bcrypt.hash('password123', 10);
  const fakeUserIds: string[] = [];

  console.log('Creating fake users...');
  for (const name of FAKE_NAMES) {
    const id = uuidv4();
    const email = name.toLowerCase().replace(/[^a-z0-9]/g, '.') + '.' + Math.floor(Math.random() * 999) + '@fakeevent.az';
    try {
      await query(
        `INSERT INTO users (user_id, name, email, password) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [id, name, email, passwordHash]
      );
      fakeUserIds.push(id);
    } catch {}
  }
  console.log(`✓ ${fakeUserIds.length} fake users created`);

  // Create events + staff + registrations
  for (const ev of EVENTS) {
    const eventId = uuidv4();
    const agenda = AGENDAS[ev.type] || AGENDAS.meetup;

    // Insert event
    await query(
      `INSERT INTO events (event_id, title, description, type, date, end_date, location, agenda, created_by, status, access_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT DO NOTHING`,
      [eventId, ev.title, ev.description, ev.type, ev.date, ev.end_date, ev.location,
       JSON.stringify(agenda), ownerId, ev.status, ev.access_type]
    );

    // Add owner to event_staff
    await query(
      `INSERT INTO event_staff (id, event_id, user_id, role) VALUES ($1,$2,$3,'owner') ON CONFLICT DO NOTHING`,
      [uuidv4(), eventId, ownerId]
    );

    // Create registrations
    const regUsers = shuffle(fakeUserIds).slice(0, ev.regCount);
    const regStatus = ev.access_type === 'approval' ? 'approved' : null;

    for (const userId of regUsers) {
      const regDate = randomDate(ev.regSpread.start, ev.regSpread.end);
      try {
        await query(
          `INSERT INTO registrations (registration_id, event_id, user_id, role, status, registered_at)
           VALUES ($1,$2,$3,'attendee',$4,$5)
           ON CONFLICT DO NOTHING`,
          [uuidv4(), eventId, userId, regStatus, regDate]
        );
      } catch {}
    }

    // Add Q&A questions for finished events
    if (ev.status === 'finished') {
      const questionTexts = [
        'Will the slides be shared after the event?',
        'Is there a recording available?',
        'What is the skill level required?',
        'Are there any prerequisites?',
        'Will there be networking opportunities?',
      ];
      const sampleUsers = shuffle(fakeUserIds).slice(0, 3);
      for (let i = 0; i < Math.min(3, sampleUsers.length); i++) {
        const qId = uuidv4();
        await query(
          `INSERT INTO questions (question_id, event_id, asked_by, content, upvotes, is_answered)
           VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
          [qId, eventId, sampleUsers[i], questionTexts[i], Math.floor(Math.random() * 15), i === 0]
        );
        if (i === 0) {
          await query(
            `INSERT INTO answers (answer_id, question_id, answered_by, content)
             VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
            [uuidv4(), qId, ownerId, 'Yes! Slides will be shared in the community Telegram group within 48 hours of the event.']
          );
        }
      }
    }

    console.log(`✓ ${ev.title} — ${ev.regCount} registrations`);
  }

  console.log('\n✅ Seed complete!');
  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
