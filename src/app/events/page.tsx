'use client';
import { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import { EVENT_TYPES } from '@/lib/utils';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';

const MOCK_EVENTS = [
  {
    event_id: 'mock-1',
    title: "TechHack Baku 2025 — 48-Hour Innovation Marathon",
    type: 'hackathon',
    date: '2025-07-15T09:00:00',
    end_date: '2025-07-17T18:00:00',
    location: 'Baku, Azerbaijan',
    description: 'Join 500+ developers, designers, and entrepreneurs. $15,000 prize pool. Mentors from Google, Microsoft, and local startups.',
    attendee_count: 312,
    status: 'published',
    owner_name: 'Orhan Aliyev',
  },
  {
    event_id: 'mock-2',
    title: 'Caucasus AI & Machine Learning Summit',
    type: 'conference',
    date: '2025-08-02T10:00:00',
    end_date: '2025-08-03T18:00:00',
    location: 'Tbilisi, Georgia',
    description: '3 tracks, 28 speakers, 850 attendees. Topics: LLMs, computer vision, MLOps. Sponsor expo included.',
    attendee_count: 850,
    status: 'published',
    owner_name: 'Nino Beridze',
  },
  {
    event_id: 'mock-3',
    title: 'Full-Stack React & Next.js Bootcamp',
    type: 'bootcamp',
    date: '2025-07-20T09:00:00',
    end_date: '2025-08-17T18:00:00',
    location: 'Online',
    description: 'Intensive 4-week program. 12 modules, live sessions, project-based learning. Certificate of completion included.',
    attendee_count: 145,
    status: 'published',
    owner_name: 'Farid Mammadov',
  },
  {
    event_id: 'mock-4',
    title: 'Startup Demo Day — Summer 2025',
    type: 'demo_day',
    date: '2025-07-28T14:00:00',
    location: 'Yerevan, Armenia',
    description: '14 early-stage startups pitch to investors. Audience voting for People\'s Choice. Jury panel from top-tier VCs.',
    attendee_count: 430,
    status: 'published',
    owner_name: 'Armine Sahakyan',
  },
  {
    event_id: 'mock-5',
    title: 'Web Security Workshop: Hands-On Pen Testing',
    type: 'workshop',
    date: '2025-08-05T09:00:00',
    location: 'Baku, Azerbaijan',
    description: 'Learn OWASP Top 10, SQL injection, XSS, and CSRF in a live lab environment. Certificate provided.',
    attendee_count: 60,
    status: 'published',
    owner_name: 'Samir Huseynov',
  },
  {
    event_id: 'mock-6',
    title: 'DevConnect Baku Meetup #18',
    type: 'meetup',
    date: '2025-07-10T18:30:00',
    location: 'Baku, Azerbaijan',
    description: 'Monthly developer gathering. Lightning talks, open networking, and food. All experience levels welcome.',
    attendee_count: 87,
    status: 'published',
    owner_name: 'Leyla Rzayeva',
  },
  {
    event_id: 'mock-7',
    title: 'Tech Founders Networking Evening',
    type: 'networking',
    date: '2025-07-22T19:00:00',
    location: 'Baku, Azerbaijan',
    description: 'Speed networking for founders, investors, and builders. Structured rounds + free networking. Profile matching enabled.',
    attendee_count: 120,
    status: 'published',
    owner_name: 'Kamran Sultanov',
  },
  {
    event_id: 'mock-8',
    title: 'Regional Coding Competition 2025',
    type: 'competition',
    date: '2025-08-10T10:00:00',
    location: 'Online',
    description: 'Solo and team tracks. 5 algorithmic rounds, live leaderboard, jury scoring. Top 3 win cash prizes.',
    attendee_count: 210,
    status: 'published',
    owner_name: 'Elnur Hasanov',
  },
  {
    event_id: 'mock-9',
    title: 'Product Management Seminar: From 0 to Launch',
    type: 'seminar',
    date: '2025-08-15T10:00:00',
    location: 'Tbilisi, Georgia',
    description: 'Full-day seminar with 4 senior PMs from Bolt, Pasha Bank, and Glovo. Frameworks, case studies, Q&A.',
    attendee_count: 95,
    status: 'published',
    owner_name: 'Tamar Kvaratskhelia',
  },
];

const TYPE_BADGE: Record<string, string> = {
  hackathon: 'bg-purple-100 text-purple-700',
  conference: 'bg-blue-100 text-blue-800',
  workshop: 'bg-green-100 text-green-700',
  bootcamp: 'bg-orange-100 text-orange-700',
  meetup: 'bg-pink-100 text-pink-700',
  networking: 'bg-yellow-100 text-yellow-700',
  competition: 'bg-red-100 text-red-700',
  demo_day: 'bg-blue-100 text-blue-800',
  seminar: 'bg-teal-100 text-teal-700',
  default: 'bg-gray-100 text-gray-700',
};

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const { data: apiEvents, isLoading } = useEvents({ search, type });
  const { user } = useAuthStore();

  const filtered = MOCK_EVENTS.filter(e => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    const matchType = !type || e.type === type;
    return matchSearch && matchType;
  });

  const events = (apiEvents && apiEvents.length > 0) ? apiEvents : filtered;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Events</h1>
          <p className="text-gray-500 text-sm mt-1">
            {events.length} event{events.length !== 1 ? 's' : ''} available
          </p>
        </div>
        {user && (
          <Link href="/events/create"
            className="flex items-center gap-1.5 bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors">
            <Plus size={15} /> New Event
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
          />
        </div>
        <select value={type} onChange={e => setType(e.target.value)}
          className="border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 bg-white">
          <option value="">All types</option>
          {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setType('')}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
            !type ? 'bg-blue-800 text-white border-blue-800' : 'text-gray-600 hover:bg-gray-50'
          }`}>
          All
        </button>
        {EVENT_TYPES.map(t => (
          <button key={t.value} onClick={() => setType(t.value === type ? '' : t.value)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              type === t.value
                ? 'bg-blue-800 text-white border-blue-800'
                : `${TYPE_BADGE[t.value] || TYPE_BADGE.default} border-transparent hover:opacity-80`
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-2">No events found</p>
          <p className="text-gray-400 text-sm">Try a different search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: any) => <EventCard key={event.event_id} event={event} />)}
        </div>
      )}
    </div>
  );
}
