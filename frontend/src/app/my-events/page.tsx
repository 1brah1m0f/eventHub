'use client';
import { useMyEvents } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { EventCard } from '@/components/EventCard';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useT } from '@/lib/i18n';

export default function MyEventsPage() {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const t = useT();
  const { data: events, isLoading } = useMyEvents();

  useEffect(() => {
    if (_hasHydrated && !user) router.push('/login');
  }, [_hasHydrated, user]);

  if (!_hasHydrated || !user) return null;

  const published = events?.filter((e: any) => e.status === 'published') || [];
  const drafts = events?.filter((e: any) => e.status === 'draft') || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('myEventsTitle')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('myEventsDesc')}</p>
        </div>
        <Link
          href="/events/create"
          className="flex items-center gap-1.5 text-sm bg-violet-800 text-white px-4 py-2 rounded-lg hover:bg-violet-900 transition-colors font-medium"
        >
          <Plus size={14} /> {t('newEvent')}
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-56 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : events?.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="mb-3">{t('noEventsYet')}</p>
          <Link href="/events/create" className="text-sm text-violet-700 hover:underline font-medium">{t('createFirstEvent')}</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {published.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t('publishedCount', { n: published.length })}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {published.map((e: any) => <EventCard key={e.event_id} event={e} />)}
              </div>
            </div>
          )}
          {drafts.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t('draftsCount', { n: drafts.length })}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drafts.map((e: any) => <EventCard key={e.event_id} event={e} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
