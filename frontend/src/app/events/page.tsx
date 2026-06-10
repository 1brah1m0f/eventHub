'use client';
import { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import { EVENT_TYPES } from '@/lib/utils';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useT } from '@/lib/i18n';

const COVER = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1000&q=80`;

// Real Baku tech events (fallback shown only if the API returns nothing).
const MOCK_EVENTS = [
  { event_id: 'mock-1', title: 'INMerge Innovation Summit 2025', type: 'summit', date: '2025-09-29T09:00:00', location: 'Baku Convention Center', description: 'PASHA Holding’s flagship Eurasian innovation summit. Keynotes and panels on AI, fintech, investment and digital transformation.', cover_image: COVER('1591115765373-5207764f72e7'), attendee_count: 850, status: 'published' },
  { event_id: 'mock-2', title: 'DevFest Baku 2025', type: 'conference', date: '2025-11-22T09:00:00', location: 'ADA University, Baku', description: 'GDG Baku’s biggest developer conference. 350+ participants, 20 speakers across web, mobile, AI/ML, backend and frontend.', cover_image: COVER('1505373877841-8d25f7d46678'), attendee_count: 350, status: 'published' },
  { event_id: 'mock-3', title: 'BHOS Hackathon 2025 (SOCAR)', type: 'hackathon', date: '2025-12-13T09:00:00', location: 'Baku Higher Oil School', description: 'SOCAR-backed hackathon for new solutions in artificial intelligence and data engineering.', cover_image: COVER('1531482615713-2afd69097998'), attendee_count: 180, status: 'published' },
  { event_id: 'mock-4', title: 'Build with AI Hackathon', type: 'hackathon', date: '2025-04-26T09:00:00', location: 'Holberton School Azerbaijan, Baku', description: 'AI hackathon by GDG Baku with Holberton School Azerbaijan and Tedspace, powered by IDDA.', cover_image: COVER('1620712943543-bcc4688e7485'), attendee_count: 140, status: 'finished' },
  { event_id: 'mock-5', title: 'JunctionX Baku 2024', type: 'hackathon', date: '2024-11-23T09:00:00', location: 'UFAZ, Baku', description: 'One of Azerbaijan’s largest hackathons. Theme: “Artificial Intelligence in the Green Economy”.', cover_image: COVER('1504384308090-c894fdcc538d'), attendee_count: 220, status: 'finished' },
  { event_id: 'mock-6', title: 'Gənc Vizyon Ideyathon', type: 'hackathon', date: '2026-04-18T09:00:00', location: 'Holberton School Azerbaijan, Baku', description: 'Youth idea-thon — students shape digital product ideas into prototypes and pitch them to a jury.', cover_image: COVER('1454165804606-c3d57bc86b40'), attendee_count: 90, status: 'published' },
  { event_id: 'mock-7', title: 'Gamesummit Baku', type: 'summit', date: '2026-06-06T10:00:00', location: 'Sea Breeze Resort, Baku', description: 'Azerbaijan’s gaming festival blending games with cosplay, music, AI and emerging technologies.', cover_image: COVER('1511512578047-dfb367046420'), attendee_count: 500, status: 'published' },
  { event_id: 'mock-8', title: 'Micro SaaS Hackathon', type: 'competition', date: '2025-09-13T09:00:00', location: 'Holberton School Azerbaijan, Baku', description: '48-hour build challenge by GDG Baku, Holberton and GoUP. Teams ship a micro-SaaS and pitch to a jury.', cover_image: COVER('1504384308090-c894fdcc538d'), attendee_count: 120, status: 'published' },
  { event_id: 'mock-9', title: 'IDDA Digital Hackathon 2.0', type: 'hackathon', date: '2026-05-16T09:00:00', location: 'Innovation Hub, Baku', description: 'Second edition of the Innovation and Digital Development Agency hackathon — AI, govtech and data-driven public services.', cover_image: COVER('1620712943543-bcc4688e7485'), attendee_count: 160, status: 'published' },
];

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const { data: apiEvents, isLoading } = useEvents({ search, type });
  const { user } = useAuthStore();
  const t = useT();

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
            placeholder={t('search')}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-gray-400 shrink-0" />
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="border border-gray-300 rounded-full px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 bg-white"
          >
            <option value="">{t('allTypes')}</option>
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* Type chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setType('')}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
            !type ? 'bg-violet-800 text-white border-violet-800' : 'text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {t('all')}
        </button>
        {EVENT_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setType(type === t.value ? '' : t.value)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              type === t.value
                ? 'bg-violet-800 text-white border-violet-800'
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
          <p className="text-gray-400 text-base">{t('noEventsFound')}</p>
          <p className="text-gray-400 text-sm mt-1">{t('tryDifferent')}</p>
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
