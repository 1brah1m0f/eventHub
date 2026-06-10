'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, Globe, CalendarDays, Megaphone, Trophy, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { EVENT_TYPES } from '@/lib/utils';
import { BadgeCard, Badge } from '@/components/Badge';

interface ProfileData {
  user: {
    user_id: string; name: string; bio?: string; skills?: string[];
    linkedin_url?: string; x_url?: string; instagram_url?: string;
    avatar_url?: string; created_at?: string;
  };
  stats: { events_attended: number; events_organized: number; badges: number };
  achievements: { achievement_id: string; type: string; label?: string; team_name?: string; event_id: string; event_title: string }[];
  history: { event_id: string; title: string; type: string; date?: string; location?: string; status: string; role?: string }[];
}

function useProfile(id: string) {
  return useQuery<ProfileData>({
    queryKey: ['public-profile', id],
    queryFn: () => api.get(`/users/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

const typeLabel = (t: string) => EVENT_TYPES.find(x => x.value === t)?.label ?? t;

function StatCard({ icon: Icon, value, label }: { icon: any; value: number; label: string }) {
  return (
    <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4 text-center">
      <Icon size={18} className="text-violet-600 mx-auto mb-1.5" />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useProfile(id);

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-28 bg-gray-200 rounded-2xl" />
      <div className="h-20 bg-gray-100 rounded-xl" />
      <div className="h-40 bg-gray-100 rounded-xl" />
    </div>
  );

  if (isError || !data) return (
    <div className="text-center py-24 text-gray-500">
      <p className="text-lg mb-2">Profile not found</p>
      <Link href="/events" className="text-sm text-violet-700 hover:underline">Back to events</Link>
    </div>
  );

  const { user, stats, achievements, history } = data;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/events" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-700 mb-5 w-fit transition-colors">
        <ArrowLeft size={14} /> Back
      </Link>

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <div className="h-24 bg-gradient-to-br from-indigo-900 via-violet-800 to-indigo-700" />
        <div className="px-5 pb-5 -mt-10">
          <div className="flex items-end gap-4">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-violet-700 flex items-center justify-center text-2xl font-bold text-white border-4 border-white shadow-md">
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex items-center gap-1 pb-1">
              {user.linkedin_url && (
                <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn"
                  className="p-2 text-gray-400 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              )}
              {user.x_url && (
                <a href={user.x_url} target="_blank" rel="noopener noreferrer" title="X"
                  className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              )}
              {user.instagram_url && (
                <a href={user.instagram_url} target="_blank" rel="noopener noreferrer" title="Instagram"
                  className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                </a>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">{user.name}</h1>
          {user.bio && <p className="text-gray-600 text-sm mt-1.5 leading-relaxed">{user.bio}</p>}
          {!!user.skills?.length && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {user.skills.map(s => (
                <span key={s} className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-md">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 mb-8">
        <StatCard icon={CalendarDays} value={stats.events_attended} label="Events attended" />
        <StatCard icon={Megaphone} value={stats.events_organized} label="Events organized" />
        <StatCard icon={Trophy} value={stats.badges} label="Badges earned" />
      </div>

      {/* Badges */}
      {achievements.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" /> Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map(a => (
              <Link key={a.achievement_id} href={`/events/${a.event_id}`} className="transition-transform hover:-translate-y-0.5">
                <BadgeCard type={a.type} label={a.label} eventTitle={a.event_title} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Event history */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Event history</h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400">No events yet.</p>
        ) : (
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            {history.map(ev => (
              <Link
                key={ev.event_id}
                href={`/events/${ev.event_id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-violet-50/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{ev.title}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span>{typeLabel(ev.type)}</span>
                    {ev.date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {format(new Date(ev.date), 'MMM yyyy')}
                      </span>
                    )}
                    {ev.location && (
                      <span className="flex items-center gap-1 truncate">
                        {ev.location === 'Online' ? <Globe size={11} /> : <MapPin size={11} />}
                        <span className="truncate">{ev.location}</span>
                      </span>
                    )}
                  </div>
                </div>
                {ev.role && ev.role !== 'attendee' && (
                  <Badge type="special" label={ev.role} />
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
