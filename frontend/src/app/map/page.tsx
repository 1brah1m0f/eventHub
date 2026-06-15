'use client';
import { useEffect, useMemo, useState } from 'react';
import { APIProvider, AdvancedMarker, InfoWindow, Map, useMap } from '@vis.gl/react-google-maps';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  BookOpen,
  BriefcaseBusiness,
  Calendar,
  Code2,
  DollarSign,
  GraduationCap,
  Handshake,
  LocateFixed,
  MapPin,
  Mic2,
  Navigation,
  Presentation,
  Rocket,
  Search,
  SlidersHorizontal,
  Target,
  Trophy,
  Users,
  Wrench,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { EVENT_TYPES } from '@/lib/utils';
import { EMPTY_EVENT_FILTERS, EventFilters, activeEventFilterCount, toEventQueryParams } from '@/lib/eventFilters';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
const DEFAULT_CENTER = { lat: 40.4093, lng: 49.8671 };

const TYPE_COLORS: Record<string, { bg: string; ring: string; text: string }> = {
  hackathon:   { bg: '#7c3aed', ring: '#ede9fe', text: '#5b21b6' },
  conference:  { bg: '#2563eb', ring: '#dbeafe', text: '#1e40af' },
  workshop:    { bg: '#059669', ring: '#d1fae5', text: '#047857' },
  bootcamp:    { bg: '#d97706', ring: '#fef3c7', text: '#92400e' },
  meetup:      { bg: '#db2777', ring: '#fce7f3', text: '#9d174d' },
  networking:  { bg: '#ca8a04', ring: '#fef9c3', text: '#854d0e' },
  competition: { bg: '#dc2626', ring: '#fee2e2', text: '#991b1b' },
  demo_day:    { bg: '#4f46e5', ring: '#e0e7ff', text: '#3730a3' },
  seminar:     { bg: '#0d9488', ring: '#ccfbf1', text: '#0f766e' },
  summit:      { bg: '#0284c7', ring: '#e0f2fe', text: '#0369a1' },
  course:      { bg: '#0891b2', ring: '#cffafe', text: '#0e7490' },
};

const TYPE_ICONS = {
  hackathon: Code2,
  conference: Mic2,
  workshop: Wrench,
  bootcamp: GraduationCap,
  meetup: Users,
  networking: Handshake,
  competition: Trophy,
  demo_day: Rocket,
  seminar: Presentation,
  summit: BriefcaseBusiness,
  course: BookOpen,
};

interface MapEvent {
  event_id: string;
  title: string;
  description?: string;
  type: string;
  date?: string;
  end_date?: string;
  location?: string;
  lat: number;
  lng: number;
  price?: number | string | null;
  is_online?: boolean;
  cover_image?: string;
  attendee_count?: number;
}

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface EventCluster {
  id: string;
  lat: number;
  lng: number;
  events: MapEvent[];
}

function useMapEvents(filters: EventFilters) {
  return useQuery<MapEvent[]>({
    queryKey: ['events', 'map', filters],
    queryFn: () =>
      api.get('/events/map', { params: toEventQueryParams(filters) }).then(r =>
        (r.data as MapEvent[])
          .map(ev => ({ ...ev, lat: Number(ev.lat), lng: Number(ev.lng), price: ev.price == null ? null : Number(ev.price) }))
          .filter(ev => Number.isFinite(ev.lat) && Number.isFinite(ev.lng))
      ),
  });
}

function typeLabel(type: string) {
  return EVENT_TYPES.find(t => t.value === type)?.label ?? type;
}

function typeColor(type: string) {
  return TYPE_COLORS[type] ?? { bg: '#475569', ring: '#e2e8f0', text: '#334155' };
}

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const radius = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(h));
}

function clusterEvents(events: MapEvent[], zoom: number): EventCluster[] {
  if (zoom >= 14) {
    return events.map(event => ({ id: event.event_id, lat: event.lat, lng: event.lng, events: [event] }));
  }

  const gridSize = zoom < 8 ? 0.6 : zoom < 10 ? 0.25 : zoom < 12 ? 0.09 : 0.035;
  const groups = new globalThis.Map<string, MapEvent[]>();

  events.forEach(event => {
    const key = `${Math.round(event.lat / gridSize)}:${Math.round(event.lng / gridSize)}`;
    groups.set(key, [...(groups.get(key) || []), event]);
  });

  return Array.from(groups.entries()).map(([id, group]) => ({
    id,
    lat: group.reduce((sum, event) => sum + event.lat, 0) / group.length,
    lng: group.reduce((sum, event) => sum + event.lng, 0) / group.length,
    events: group,
  }));
}

function inBounds(event: MapEvent, bounds: Bounds | null) {
  if (!bounds) return true;
  return event.lat <= bounds.north && event.lat >= bounds.south && event.lng <= bounds.east && event.lng >= bounds.west;
}

function ViewportSync({ events, onBoundsChange, onZoomChange }: { events: MapEvent[]; onBoundsChange: (bounds: Bounds | null) => void; onZoomChange: (zoom: number) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('idle', () => {
      const mapBounds = map.getBounds();
      const zoom = map.getZoom();
      onZoomChange(zoom ?? 11);
      if (!mapBounds) {
        onBoundsChange(null);
        return;
      }
      const ne = mapBounds.getNorthEast();
      const sw = mapBounds.getSouthWest();
      onBoundsChange({ north: ne.lat(), east: ne.lng(), south: sw.lat(), west: sw.lng() });
    });
    return () => listener.remove();
  }, [map, onBoundsChange, onZoomChange]);

  useEffect(() => {
    if (!map || events.length === 0 || !(window as any).google?.maps) return;
    const bounds = new (window as any).google.maps.LatLngBounds();
    events.forEach(event => bounds.extend({ lat: event.lat, lng: event.lng }));
    map.fitBounds(bounds, 72);
  }, [map, events]);

  return null;
}

function ClusterMarker({ cluster, selectedId, onSelect }: { cluster: EventCluster; selectedId?: string; onSelect: (event: MapEvent) => void }) {
  const map = useMap();
  const isCluster = cluster.events.length > 1;
  const event = cluster.events[0];
  const color = typeColor(event.type);
  const EventIcon = TYPE_ICONS[event.type as keyof typeof TYPE_ICONS] ?? MapPin;
  const selected = selectedId === event.event_id;

  return (
    <AdvancedMarker
      position={{ lat: cluster.lat, lng: cluster.lng }}
      title={isCluster ? `${cluster.events.length} events` : event.title}
      onClick={() => {
        if (isCluster) {
          map?.panTo({ lat: cluster.lat, lng: cluster.lng });
          map?.setZoom(Math.min((map.getZoom() ?? 11) + 2, 17));
          return;
        }
        onSelect(event);
      }}
    >
      {isCluster ? (
        <div className="grid h-11 min-w-11 place-items-center rounded-full border-2 border-white bg-gray-950 px-3 text-sm font-bold text-white shadow-lg shadow-gray-950/25 transition-transform hover:scale-105">
          {cluster.events.length}
        </div>
      ) : (
        <div
          className={`group relative grid h-12 w-12 place-items-center rounded-2xl border-2 border-white text-white shadow-lg transition-all hover:-translate-y-1 hover:scale-105 ${selected ? '-translate-y-1 scale-110' : ''}`}
          style={{ backgroundColor: color.bg, boxShadow: `0 16px 30px ${color.bg}35` }}
        >
          <EventIcon size={22} strokeWidth={2.2} />
          <span className="absolute -bottom-1 h-3 w-3 rotate-45 border-b-2 border-r-2 border-white" style={{ backgroundColor: color.bg }} />
        </div>
      )}
    </AdvancedMarker>
  );
}

function MapControls({ userLocation, onMyLocation, onNearby, nearby, onFit }: { userLocation: { lat: number; lng: number } | null; onMyLocation: () => void; onNearby: () => void; nearby: boolean; onFit: () => void }) {
  const map = useMap();

  return (
    <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
      <button
        type="button"
        onClick={() => {
          onMyLocation();
          if (userLocation) map?.panTo(userLocation);
        }}
        className="grid h-10 w-10 place-items-center rounded-xl bg-white text-gray-700 shadow-lg shadow-gray-900/10 ring-1 ring-gray-200 hover:text-violet-800"
        aria-label="Center on my location"
      >
        <LocateFixed size={17} />
      </button>
      <button
        type="button"
        onClick={onNearby}
        className={`grid h-10 w-10 place-items-center rounded-xl shadow-lg shadow-gray-900/10 ring-1 ring-gray-200 ${nearby ? 'bg-violet-800 text-white' : 'bg-white text-gray-700 hover:text-violet-800'}`}
        aria-label="Show nearby events"
      >
        <Navigation size={17} />
      </button>
      <button
        type="button"
        onClick={onFit}
        className="grid h-10 w-10 place-items-center rounded-xl bg-white text-gray-700 shadow-lg shadow-gray-900/10 ring-1 ring-gray-200 hover:text-violet-800"
        aria-label="Fit map to visible events"
      >
        <Target size={17} />
      </button>
    </div>
  );
}

function EventPreview({ event, onClose }: { event: MapEvent; onClose: () => void }) {
  const color = typeColor(event.type);
  const price = Number(event.price || 0);

  return (
    <InfoWindow position={{ lat: event.lat, lng: event.lng }} onCloseClick={onClose} headerDisabled>
      <div className="w-[280px] overflow-hidden rounded-xl bg-white">
        {event.cover_image ? (
          <img src={event.cover_image} alt={event.title} className="h-36 w-full object-cover" />
        ) : (
          <div className="h-28 w-full" style={{ background: `linear-gradient(135deg, ${color.bg}, #111827)` }} />
        )}
        <div className="p-4">
          <span className="mb-2 inline-flex rounded-md px-2 py-1 text-xs font-semibold" style={{ backgroundColor: color.ring, color: color.text }}>
            {typeLabel(event.type)}
          </span>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-gray-900">{event.title}</h3>
          {event.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">{event.description}</p>}
          <div className="mt-3 space-y-1.5 text-xs text-gray-500">
            {event.date && (
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="shrink-0 text-violet-700" />
                {format(new Date(event.date), 'MMM d, yyyy, HH:mm')}
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="shrink-0 text-violet-700" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <DollarSign size={12} className="shrink-0 text-violet-700" />
              {price > 0 ? `$${price.toFixed(2)}` : 'Free'}
            </div>
            {Number(event.attendee_count) > 0 && (
              <div className="flex items-center gap-1.5">
                <Users size={12} className="shrink-0 text-violet-700" />
                {Number(event.attendee_count).toLocaleString()} registered
              </div>
            )}
          </div>
          <Link
            href={`/events/${event.event_id}`}
            className="mt-4 block rounded-lg bg-violet-800 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-violet-900"
          >
            View Details
          </Link>
        </div>
      </div>
    </InfoWindow>
  );
}

export default function MapPage() {
  const [filters, setFilters] = useState(EMPTY_EVENT_FILTERS);
  const [selected, setSelected] = useState<MapEvent | null>(null);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [zoom, setZoom] = useState(11);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [fitVersion, setFitVersion] = useState(0);
  const { data: events = [], isLoading, isError, refetch } = useMapEvents(filters);

  const activeFilters = activeEventFilterCount(filters);
  const visibleEvents = useMemo(() => {
    const nearbyEvents = nearbyOnly && userLocation
      ? events.filter(event => distanceKm(userLocation, event) <= 25)
      : events;
    return nearbyEvents;
  }, [events, nearbyOnly, userLocation]);
  const viewportCount = useMemo(() => visibleEvents.filter(event => inBounds(event, bounds)).length, [visibleEvents, bounds]);
  const clusters = useMemo(() => clusterEvents(visibleEvents, zoom), [visibleEvents, zoom]);

  const setFilter = <K extends keyof EventFilters>(key: K, value: EventFilters[K]) => {
    setSelected(null);
    setFilters(current => ({ ...current, [key]: value }));
  };

  const locateUser = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      position => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      undefined,
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  if (!API_KEY) {
    return (
      <div className="grid min-h-[calc(100dvh-56px)] place-items-center px-4">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <MapPin className="mx-auto text-gray-300" size={32} />
          <h1 className="mt-3 text-lg font-semibold text-gray-900">Map is not configured</h1>
          <p className="mt-2 text-sm text-gray-500">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable event discovery on the map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[calc(100dvh-56px)] grid-cols-1 bg-gray-50 lg:grid-cols-[380px_1fr]">
      <aside className="z-20 border-b border-gray-200 bg-white p-4 shadow-sm lg:border-b-0 lg:border-r lg:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Event Map</h1>
            <p className="mt-1 text-sm text-gray-500">Explore published events by place, time, format, and category.</p>
          </div>
          {activeFilters > 0 && (
            <button
              type="button"
              onClick={() => {
                setFilters(EMPTY_EVENT_FILTERS);
                setNearbyOnly(false);
              }}
              className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </div>

        <div className="mt-5 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
              placeholder="Search by event name"
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700"
            />
          </div>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              value={filters.location}
              onChange={e => setFilter('location', e.target.value)}
              placeholder="Filter by location"
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700"
            />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Date range</span>
              {(filters.date_from || filters.date_to) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilter('date_from', '');
                    setFilter('date_to', '');
                  }}
                  className="text-xs font-medium text-violet-700 hover:text-violet-900"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="grid gap-1 text-[11px] font-medium text-gray-500">
                From
                <input
                  type="date"
                  value={filters.date_from}
                  max={filters.date_to || undefined}
                  onChange={e => setFilter('date_from', e.target.value)}
                  className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-700"
                />
              </label>
              <label className="grid gap-1 text-[11px] font-medium text-gray-500">
                To
                <input
                  type="date"
                  value={filters.date_to}
                  min={filters.date_from || undefined}
                  onChange={e => setFilter('date_to', e.target.value)}
                  className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-700"
                />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={filters.price} onChange={e => setFilter('price', e.target.value as EventFilters['price'])} className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700">
              <option value="">Any price</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
            <select value={filters.event_mode} onChange={e => setFilter('event_mode', e.target.value as EventFilters['event_mode'])} className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700">
              <option value="">Online/offline</option>
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
          <button
            onClick={() => setFilter('type', '')}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${!filters.type ? 'border-violet-800 bg-violet-800 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            All
          </button>
          {EVENT_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => setFilter('type', filters.type === type.value ? '' : type.value)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${filters.type === type.value ? 'border-violet-800 bg-violet-800 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-2 text-center">
          <div className="rounded-xl bg-white p-3">
            <p className="text-lg font-bold text-gray-900">{visibleEvents.length}</p>
            <p className="text-[11px] font-medium text-gray-500">visible</p>
          </div>
          <div className="rounded-xl bg-white p-3">
            <p className="text-lg font-bold text-gray-900">{viewportCount}</p>
            <p className="text-[11px] font-medium text-gray-500">in view</p>
          </div>
          <div className="rounded-xl bg-white p-3">
            <p className="text-lg font-bold text-gray-900">{clusters.length}</p>
            <p className="text-[11px] font-medium text-gray-500">markers</p>
          </div>
        </div>

        {nearbyOnly && (
          <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-800">
            Showing events within 25 km of your location.
          </div>
        )}

        <div className="mt-5 hidden gap-2 lg:flex">
          <button
            type="button"
            onClick={() => setFitVersion(version => version + 1)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <SlidersHorizontal size={15} />
            Fit results
          </button>
          <button
            type="button"
            onClick={() => {
              if (!userLocation) locateUser();
              setNearbyOnly(value => !value);
            }}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold ${nearbyOnly ? 'bg-violet-800 text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <Navigation size={15} />
            Nearby
          </button>
        </div>
      </aside>

      <section className="relative min-h-[560px] overflow-hidden lg:min-h-[calc(100dvh-56px)]">
        <APIProvider apiKey={API_KEY}>
          <Map
            mapId={MAP_ID}
            defaultCenter={DEFAULT_CENTER}
            defaultZoom={11}
            style={{ width: '100%', height: '100%' }}
            onClick={() => setSelected(null)}
            gestureHandling="greedy"
            clickableIcons={false}
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl={false}
          >
            <ViewportSync key={`${filters.type}-${filters.search}-${filters.location}-${filters.date_from}-${filters.date_to}-${filters.price}-${filters.event_mode}-${nearbyOnly}-${fitVersion}`} events={visibleEvents} onBoundsChange={setBounds} onZoomChange={setZoom} />
            <MapControls
              userLocation={userLocation}
              onMyLocation={locateUser}
              nearby={nearbyOnly}
              onNearby={() => {
                if (!userLocation) locateUser();
                setNearbyOnly(value => !value);
              }}
              onFit={() => setFitVersion(version => version + 1)}
            />

            {userLocation && (
              <AdvancedMarker position={userLocation} title="Your location">
                <div className="h-5 w-5 rounded-full border-4 border-white bg-blue-600 shadow-lg shadow-blue-600/30 ring-4 ring-blue-200" />
              </AdvancedMarker>
            )}

            {clusters.map(cluster => (
              <ClusterMarker key={cluster.id} cluster={cluster} selectedId={selected?.event_id} onSelect={setSelected} />
            ))}

            {selected && <EventPreview event={selected} onClose={() => setSelected(null)} />}
          </Map>
        </APIProvider>

        <div className="absolute left-4 top-4 z-10 rounded-xl bg-white/95 px-3 py-2 text-sm font-medium text-gray-700 shadow-lg shadow-gray-900/10 ring-1 ring-gray-200 backdrop-blur">
          {viewportCount} event{viewportCount === 1 ? '' : 's'} in current view
        </div>

        {isLoading && (
          <div className="absolute inset-0 z-20 bg-white/75 p-4 backdrop-blur-sm">
            <div className="h-full w-full animate-pulse rounded-2xl bg-gray-100" />
          </div>
        )}

        {isError && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-white/85 p-4 backdrop-blur-sm">
            <div className="max-w-sm rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-lg">
              <p className="font-semibold text-gray-900">Map events could not load</p>
              <p className="mt-1 text-sm text-gray-500">Please try again. Your filters are preserved.</p>
              <button onClick={() => refetch()} className="mt-4 rounded-lg bg-violet-800 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-900">Retry</button>
            </div>
          </div>
        )}

        {!isLoading && !isError && visibleEvents.length === 0 && (
          <div className="absolute inset-0 z-10 grid place-items-center p-4 pointer-events-none">
            <div className="max-w-sm rounded-2xl border border-gray-200 bg-white/95 p-5 text-center shadow-lg shadow-gray-900/10 backdrop-blur">
              <MapPin className="mx-auto text-gray-300" size={30} />
              <p className="mt-2 font-semibold text-gray-900">No pinned events match</p>
              <p className="mt-1 text-sm text-gray-500">Published offline events need latitude and longitude to appear here.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
