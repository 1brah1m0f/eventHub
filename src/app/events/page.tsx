'use client';
import { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import { EVENT_TYPES } from '@/lib/utils';
import { Search } from 'lucide-react';

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const { data: events, isLoading } = useEvents({ search, type });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select value={type} onChange={e => setType(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All types</option>
          {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : events?.length === 0 ? (
        <p className="text-center text-gray-500 py-20">No events found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event: any) => <EventCard key={event.event_id} event={event} />)}
        </div>
      )}
    </div>
  );
}
