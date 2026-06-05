'use client';
import { useMyStaffEvents } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { EventCard } from '@/components/EventCard';

export default function StaffEventsPage() {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const { data: events, isLoading } = useMyStaffEvents();

  useEffect(() => {
    if (_hasHydrated && !user) router.push('/login');
  }, [_hasHydrated, user]);

  if (!_hasHydrated || !user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Staff Events</h1>
        <p className="text-sm text-gray-400 mt-0.5">Events where you are a staff member</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-56 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : events?.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p>Not a staff member on any events</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events?.map((e: any) => <EventCard key={e.event_id} event={e} />)}
        </div>
      )}
    </div>
  );
}
