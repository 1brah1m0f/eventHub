'use client';
import { useMyRegistrations } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { EventCard } from '@/components/EventCard';
import Link from 'next/link';
import { useT } from '@/lib/i18n';

export default function RegisteredEventsPage() {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const t = useT();
  const { data: events, isLoading } = useMyRegistrations();

  useEffect(() => {
    if (_hasHydrated && !user) router.push('/login');
  }, [_hasHydrated, user]);

  if (!_hasHydrated || !user) return null;

  const now = new Date();
  const upcoming = events?.filter((e: any) => !e.date || new Date(e.date) >= now) || [];
  const past = events?.filter((e: any) => e.date && new Date(e.date) < now) || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{t('registeredEventsTitle')}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t('registeredEventsDesc')}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-56 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : events?.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="mb-3">{t('notRegistered')}</p>
          <Link href="/events" className="text-sm text-violet-700 hover:underline font-medium">{t('browseEvents')}</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t('upcomingCount', { n: upcoming.length })}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map((e: any) => <EventCard key={e.event_id} event={e} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t('pastCount', { n: past.length })}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {past.map((e: any) => <EventCard key={e.event_id} event={e} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
