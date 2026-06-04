'use client';
import { useAttendees } from '@/hooks/useEvents';
import { Users } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  eventId: string;
}

export function AttendeesPanel({ eventId }: Props) {
  const { data: attendees, isLoading } = useAttendees(eventId);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Users size={16} className="text-blue-700" />
        <h3 className="font-semibold text-gray-900">Registrations</h3>
        {attendees && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {attendees.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : !attendees?.length ? (
        <p className="text-sm text-gray-400">No registrations yet.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {attendees.map((a: any) => (
            <div key={a.user_id} className="py-2.5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {a.avatar_url ? (
                  <img src={a.avatar_url} className="w-8 h-8 rounded-full object-cover shrink-0" alt={a.name} />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {a.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{a.name}</p>
                  <p className="text-xs text-gray-400 truncate">{a.email}</p>
                  {a.team_name && (
                    <p className="text-xs text-blue-700 font-medium mt-0.5">
                      Team: {a.team_name}
                      {a.team_members?.length ? ` · ${a.team_members.join(', ')}` : ''}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md capitalize">{a.role}</span>
                {a.registered_at && (
                  <p className="text-xs text-gray-400 mt-1">{format(new Date(a.registered_at), 'MMM d')}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
