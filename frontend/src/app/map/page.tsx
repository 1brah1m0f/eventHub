'use client';
import { useState } from 'react';
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { EVENT_TYPES } from '@/lib/utils';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

const TYPE_COLORS: Record<string, { bg: string; border: string }> = {
  hackathon:   { bg: '#7c3aed', border: '#5b21b6' },
  conference:  { bg: '#1d4ed8', border: '#1e3a8a' },
  workshop:    { bg: '#059669', border: '#065f46' },
  bootcamp:    { bg: '#d97706', border: '#92400e' },
  meetup:      { bg: '#db2777', border: '#9d174d' },
  networking:  { bg: '#ca8a04', border: '#78350f' },
  competition: { bg: '#dc2626', border: '#7f1d1d' },
  demo_day:    { bg: '#4338ca', border: '#312e81' },
  seminar:     { bg: '#0d9488', border: '#134e4a' },
  summit:      { bg: '#0284c7', border: '#0c4a6e' },
};

interface MapEvent {
  event_id: string; title: string; type: string;
  date?: string; location?: string; lat: number; lng: number;
  cover_image?: string; attendee_count?: number;
}

function useMapEvents(type: string) {
  return useQuery({
    queryKey: ['events', 'map', type],
    queryFn: () => api.get('/events/map', { params: type ? { type } : {} }).then(r => r.data),
  });
}

export default function MapPage() {
  const [selectedType, setSelectedType] = useState('');
  const [selected, setSelected] = useState<MapEvent | null>(null);
  const { data: events = [] } = useMapEvents(selectedType);

  const col = (type: string) => TYPE_COLORS[type] ?? { bg: '#475569', border: '#1e293b' };
  const typeLabel = (type: string) => EVENT_TYPES.find(t => t.value === type)?.label ?? type;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Filter chips */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 shadow-sm">
        <button
          onClick={() => { setSelectedType(''); setSelected(null); }}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium shrink-0 transition-colors ${
            !selectedType ? 'bg-violet-800 text-white border-violet-800' : 'text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >All</button>
        {EVENT_TYPES.map(t => {
          const active = selectedType === t.value;
          const c = col(t.value);
          return (
            <button
              key={t.value}
              onClick={() => { setSelectedType(active ? '' : t.value); setSelected(null); }}
              className="text-xs px-3 py-1.5 rounded-full border font-medium shrink-0 transition-all"
              style={active
                ? { backgroundColor: c.bg, color: '#fff', borderColor: c.bg }
                : { color: '#4b5563', borderColor: '#e5e7eb' }
              }
            >{t.label}</button>
          );
        })}
        <span className="text-xs text-gray-400 shrink-0 ml-1 whitespace-nowrap">
          {(events as MapEvent[]).length} event{(events as MapEvent[]).length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={{ lat: 40.4093, lng: 49.8671 }}
            defaultZoom={10}
            style={{ width: '100%', height: '100%' }}
            onClick={() => setSelected(null)}
            gestureHandling="greedy"
          >
            {(events as MapEvent[]).map(ev => (
              <Marker
                key={ev.event_id}
                position={{ lat: ev.lat, lng: ev.lng }}
                onClick={() => setSelected(ev)}
                title={ev.title}
              />
            ))}

            {selected && (
              <InfoWindow
                position={{ lat: selected.lat, lng: selected.lng }}
                onCloseClick={() => setSelected(null)}
                headerDisabled
              >
                <div className="w-64 overflow-hidden rounded-lg">
                  {selected.cover_image && (
                    <img
                      src={selected.cover_image} alt={selected.title}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-3">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-md inline-block mb-2"
                      style={{
                        backgroundColor: col(selected.type).bg + '18',
                        color: col(selected.type).bg,
                      }}
                    >
                      {typeLabel(selected.type)}
                    </span>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2">{selected.title}</h3>
                    <div className="space-y-1 text-xs text-gray-500 mb-3">
                      {selected.date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className="text-violet-600 shrink-0" />
                          {format(new Date(selected.date), 'MMM d, yyyy · HH:mm')}
                        </div>
                      )}
                      {selected.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={11} className="text-violet-600 shrink-0" />
                          <span className="truncate">{selected.location}</span>
                        </div>
                      )}
                      {Number(selected.attendee_count) > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Users size={11} className="text-violet-600 shrink-0" />
                          {Number(selected.attendee_count).toLocaleString()} registered
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/events/${selected.event_id}`}
                      className="block text-center text-xs font-medium bg-violet-800 text-white py-1.5 rounded-lg hover:bg-violet-900 transition-colors"
                    >
                      View Event →
                    </Link>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Empty state overlay */}
        {(events as MapEvent[]).length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg text-center">
              <MapPin size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">No upcoming events with location</p>
              <p className="text-xs text-gray-400 mt-0.5">Events must have a pinned location to appear on the map</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
