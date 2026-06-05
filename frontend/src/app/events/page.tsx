'use client';
import { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import { EVENT_TYPES } from '@/lib/utils';
import { Search, Plus, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';

const MOCK_EVENTS = [
  { event_id: 'mock-1', title: 'TechHack Baku 2025', type: 'hackathon', date: '2026-09-15T09:00:00', location: 'Baku, Azerbaijan', description: 'Join 500+ developers for 48 hours of building. $15,000 prize pool. Mentors from Google, Microsoft, and regional startups.', attendee_count: 312, status: 'published' },
  { event_id: 'mock-2', title: 'Caucasus AI Summit', type: 'conference', date: '2026-10-02T10:00:00', location: 'Tbilisi, Georgia', description: '3 tracks, 28 speakers, 850 attendees. Topics: LLMs, computer vision, and MLOps.', attendee_count: 850, status: 'published' },
  { event_id: 'mock-3', title: 'Full-Stack React Bootcamp', type: 'bootcamp', date: '2026-09-20T09:00:00', location: 'Online', description: 'Intensive 4-week program. 12 live modules, project-based learning, and certificate of completion.', attendee_count: 145, status: 'published' },
  { event_id: 'mock-4', title: 'Startup Demo Day Summer 2026', type: 'demo_day', date: '2026-09-28T14:00:00', location: 'Yerevan, Armenia', description: '14 early-stage startups pitch to investors. Audience voting for People\'s Choice.', attendee_count: 430, status: 'published' },
  { event_id: 'mock-5', title: 'Web Security Workshop', type: 'workshop', date: '2026-10-05T09:00:00', location: 'Baku, Azerbaijan', description: 'Learn OWASP Top 10, SQL injection, and XSS in a controlled lab environment.', attendee_count: 60, status: 'published' },
  { event_id: 'mock-6', title: 'DevConnect Baku Meetup #18', type: 'meetup', date: '2026-09-10T18:30:00', location: 'Baku, Azerbaijan', description: 'Monthly developer gathering. Lightning talks, open networking, food and drinks.', attendee_count: 87, status: 'published' },
  { event_id: 'mock-7', title: 'Tech Founders Networking Evening', type: 'networking', date: '2026-09-22T19:00:00', location: 'Baku, Azerbaijan', description: 'Speed networking for founders, investors, and builders.', attendee_count: 120, status: 'published' },
  { event_id: 'mock-8', title: 'Regional Coding Competition 2026', type: 'competition', date: '2026-10-10T10:00:00', location: 'Online', description: 'Solo and team tracks. 5 algorithmic rounds, live leaderboard, cash prizes.', attendee_count: 210, status: 'published' },
  { event_id: 'mock-9', title: 'Product Management Seminar', type: 'seminar', date: '2026-10-15T10:00:00', location: 'Tbilisi, Georgia', description: 'Full-day seminar with 4 senior PMs from Bolt, Pasha Bank, and Glovo.', attendee_count: 95, status: 'published' },
];

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const { data: apiEvents, isLoading } = useEvents({ search, type });
  const { user } = useAuthStore();

  const filtered = MOCK_EVENTS.filter(e => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase());
    const matchType = !type || e.type === type;
    return matchSearch && matchType;
  });

  const events = (apiEvents && apiEvents.length > 0) ? apiEvents : filtered;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">


      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-gray-400 shrink-0" />
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 bg-white"
          >
            <option value="">All types</option>
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* Type chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setType('')}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
            !type ? 'bg-blue-800 text-white border-blue-800' : 'text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        {EVENT_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setType(type === t.value ? '' : t.value)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              type === t.value
                ? 'bg-blue-800 text-white border-blue-800'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-400 text-base">No events found</p>
          <p className="text-gray-400 text-sm mt-1">Try a different search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event: any) => (
            <EventCard key={event.event_id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
