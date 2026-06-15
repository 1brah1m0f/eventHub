'use client';
import { useEffect, useRef, useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import { EVENT_TYPES } from '@/lib/utils';
import { MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { EMPTY_EVENT_FILTERS, activeEventFilterCount, isInDateRange, toEventQueryParams } from '@/lib/eventFilters';

const COVER = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1000&q=80`;
type EventListItem = { event_id: string; date?: string | null; [key: string]: unknown };

const MOCK_EVENTS = [
  { event_id: 'mock-1', title: 'INMerge Innovation Summit 2025', type: 'summit', date: '2025-09-29T09:00:00', location: 'Baku Convention Center', description: 'PASHA Holding flagship Eurasian innovation summit with keynotes and panels on AI, fintech, investment and digital transformation.', cover_image: COVER('1591115765373-5207764f72e7'), attendee_count: 850, status: 'published', price: 0, is_online: false },
  { event_id: 'mock-2', title: 'DevFest Baku 2025', type: 'conference', date: '2025-11-22T09:00:00', location: 'ADA University, Baku', description: 'GDG Baku developer conference with sessions across web, mobile, AI/ML, backend and frontend.', cover_image: COVER('1505373877841-8d25f7d46678'), attendee_count: 350, status: 'published', price: 35, is_online: false },
  { event_id: 'mock-3', title: 'BHOS Hackathon 2025 (SOCAR)', type: 'hackathon', date: '2025-12-13T09:00:00', location: 'Baku Higher Oil School', description: 'SOCAR-backed hackathon for new solutions in artificial intelligence and data engineering.', cover_image: COVER('1531482615713-2afd69097998'), attendee_count: 180, status: 'published', price: 0, is_online: false },
  { event_id: 'mock-4', title: 'Build with AI Hackathon', type: 'hackathon', date: '2025-04-26T09:00:00', location: 'Holberton School Azerbaijan, Baku', description: 'AI hackathon by GDG Baku with Holberton School Azerbaijan and Tedspace, powered by IDDA.', cover_image: COVER('1620712943543-bcc4688e7485'), attendee_count: 140, status: 'finished', price: 0, is_online: false },
  { event_id: 'mock-5', title: 'JunctionX Baku 2024', type: 'hackathon', date: '2024-11-23T09:00:00', location: 'UFAZ, Baku', description: 'One of Azerbaijan largest hackathons with a green-economy artificial intelligence theme.', cover_image: COVER('1504384308090-c894fdcc538d'), attendee_count: 220, status: 'finished', price: 0, is_online: false },
  { event_id: 'mock-6', title: 'Genc Vizyon Ideyathon', type: 'hackathon', date: '2026-04-18T09:00:00', location: 'Holberton School Azerbaijan, Baku', description: 'Youth idea-thon where students shape digital product ideas into prototypes and pitch them to a jury.', cover_image: COVER('1454165804606-c3d57bc86b40'), attendee_count: 90, status: 'published', price: 0, is_online: false },
  { event_id: 'mock-7', title: 'Gamesummit Baku', type: 'summit', date: '2026-06-06T10:00:00', location: 'Sea Breeze Resort, Baku', description: 'Azerbaijan gaming festival blending games with cosplay, music, AI and emerging technologies.', cover_image: COVER('1511512578047-dfb367046420'), attendee_count: 500, status: 'published', price: 25, is_online: false },
  { event_id: 'mock-8', title: 'Micro SaaS Hackathon', type: 'competition', date: '2025-09-13T09:00:00', location: 'Holberton School Azerbaijan, Baku', description: '48-hour build challenge by GDG Baku, Holberton and GoUP. Teams ship a micro-SaaS and pitch to a jury.', cover_image: COVER('1504384308090-c894fdcc538d'), attendee_count: 120, status: 'published', price: 0, is_online: false },
  { event_id: 'mock-9', title: 'IDDA Digital Hackathon 2.0', type: 'hackathon', date: '2026-05-16T09:00:00', location: 'Innovation Hub, Baku', description: 'Second edition of the Innovation and Digital Development Agency hackathon for AI, govtech and data-driven public services.', cover_image: COVER('1620712943543-bcc4688e7485'), attendee_count: 160, status: 'published', price: 0, is_online: false },
];

export default function EventsPage() {
  const [filters, setFilters] = useState(EMPTY_EVENT_FILTERS);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const dateFromInputRef = useRef<HTMLInputElement>(null);
  const { data: apiEvents, isLoading } = useEvents(toEventQueryParams(filters));
  const t = useT();
  const activeFilters = activeEventFilterCount(filters);

  useEffect(() => {
    if (!isDateFilterOpen) return;

    const picker = dateFromInputRef.current;
    picker?.focus();
    try {
      picker?.showPicker?.();
    } catch {
      // Some browsers only allow opening the native picker directly inside the click event.
    }
  }, [isDateFilterOpen]);

  const fallbackEvents = MOCK_EVENTS.filter(e => {
    const matchSearch = !filters.search || e.title.toLowerCase().includes(filters.search.toLowerCase()) || e.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchType = !filters.type || e.type === filters.type;
    const matchLocation = !filters.location || e.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchPrice = !filters.price || (filters.price === 'free' ? !Number(e.price) : Number(e.price) > 0);
    const matchMode = !filters.event_mode || (filters.event_mode === 'online' ? e.is_online : !e.is_online);
    return matchSearch && matchType && matchLocation && matchPrice && matchMode && isInDateRange(e, filters.date_from, filters.date_to);
  });

  const apiEventList = (Array.isArray(apiEvents) ? apiEvents : []) as EventListItem[];
  const apiFiltered = apiEventList.filter(e => isInDateRange(e, filters.date_from, filters.date_to));
  const events: EventListItem[] = apiEvents && apiEvents.length > 0 ? apiFiltered : fallbackEvents;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="mt-1 text-sm text-gray-500">Discover events by name, category, date, place, price, and format.</p>
        </div>
        {activeFilters > 0 && (
          <button
            type="button"
            onClick={() => setFilters(EMPTY_EVENT_FILTERS)}
            className="w-fit rounded-full border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Clear {activeFilters} filter{activeFilters > 1 ? 's' : ''}
          </button>
        )}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
          <input
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            placeholder={t('search')}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 bg-white"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
          <input
            value={filters.location}
            onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
            placeholder="Location"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 bg-white"
          />
        </div>

        <div className="relative">
          <select
            value={filters.type}
            onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
            className="w-full appearance-none border border-gray-300 rounded-full pl-3 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 bg-white"
          >
            <option value="">{t('allTypes')}</option>
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <button
            type="button"
            onClick={() => setIsDateFilterOpen(open => !open)}
            aria-label="Filter by date range"
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full transition-colors ${
              filters.date_from || filters.date_to ? 'bg-violet-800 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <SlidersHorizontal size={15} />
          </button>
          {isDateFilterOpen && (
            <div className="absolute right-0 top-12 z-20 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
              <div className="mb-3 text-sm font-semibold text-gray-900">{t('dateRange')}</div>
              <div className="grid gap-3">
                <label className="grid gap-1 text-xs font-medium text-gray-500">
                  {t('from')}
                  <input
                    ref={dateFromInputRef}
                    type="date"
                    value={filters.date_from}
                    max={filters.date_to || undefined}
                    onChange={e => setFilters(f => ({ ...f, date_from: e.target.value }))}
                    className="rounded-full border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-700"
                  />
                </label>
                <label className="grid gap-1 text-xs font-medium text-gray-500">
                  {t('to')}
                  <input
                    type="date"
                    value={filters.date_to}
                    min={filters.date_from || undefined}
                    onChange={e => setFilters(f => ({ ...f, date_to: e.target.value }))}
                    className="rounded-full border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-700"
                  />
                </label>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setFilters(f => ({ ...f, date_from: '', date_to: '' }))}
                  className="rounded-full px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-100"
                >
                  {t('clear')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDateFilterOpen(false)}
                  className="rounded-full bg-violet-800 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-900"
                >
                  {t('apply')}
                </button>
              </div>
            </div>
          )}
        </div>

        <select
          value={filters.price}
          onChange={e => setFilters(f => ({ ...f, price: e.target.value as typeof filters.price }))}
          className="appearance-none border border-gray-300 rounded-full px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 bg-white"
        >
          <option value="">Any price</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>

        <select
          value={filters.event_mode}
          onChange={e => setFilters(f => ({ ...f, event_mode: e.target.value as typeof filters.event_mode }))}
          className="appearance-none border border-gray-300 rounded-full px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 bg-white"
        >
          <option value="">Online or offline</option>
          <option value="offline">Offline</option>
          <option value="online">Online</option>
        </select>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilters(f => ({ ...f, type: '' }))}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
            !filters.type ? 'bg-violet-800 text-white border-violet-800' : 'text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {t('all')}
        </button>
        {EVENT_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setFilters(f => ({ ...f, type: f.type === t.value ? '' : t.value }))}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              filters.type === t.value
                ? 'bg-violet-800 text-white border-violet-800'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

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
          {events.map(event => (
            <EventCard key={event.event_id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
