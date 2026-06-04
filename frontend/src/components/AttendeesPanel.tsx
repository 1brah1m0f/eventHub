'use client';
import { useAttendees } from '@/hooks/useEvents';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Check, X, RefreshCw, Copy } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface Props {
  eventId: string;
  isOwner?: boolean;
  accessType?: string;
  inviteCode?: string;
  eventTitle?: string;
}

function usePendingRequests(eventId: string, isOwner: boolean) {
  return useQuery({
    queryKey: ['pending', eventId],
    queryFn: () => api.get(`/events/${eventId}/pending`).then(r => r.data),
    enabled: isOwner,
  });
}

export function AttendeesPanel({ eventId, isOwner = false, accessType, inviteCode, eventTitle }: Props) {
  const [tab, setTab] = useState<'attendees' | 'pending'>('attendees');
  const qc = useQueryClient();

  const { data: attendees, isLoading } = useAttendees(eventId);
  const { data: pending } = usePendingRequests(eventId, isOwner);

  const review = useMutation({
    mutationFn: ({ userId, action }: { userId: string; action: 'approve' | 'reject' }) =>
      api.patch(`/events/${eventId}/registrations/${userId}`, { action }).then(r => r.data),
    onSuccess: (_, { action }) => {
      toast.success(action === 'approve' ? 'Approved' : 'Rejected');
      qc.invalidateQueries({ queryKey: ['pending', eventId] });
      qc.invalidateQueries({ queryKey: ['attendees', eventId] });
    },
    onError: () => toast.error('Failed'),
  });

  const regen = useMutation({
    mutationFn: () => api.post(`/events/${eventId}/invite-code/regenerate`).then(r => r.data),
    onSuccess: () => {
      toast.success('Invite link regenerated');
      qc.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });

  const copyInviteLink = () => {
    if (!inviteCode) return;
    const url = `${window.location.origin}/events/${eventId}?code=${inviteCode}`;
    navigator.clipboard.writeText(url);
    toast.success('Invite link copied');
  };

  const pendingCount = pending?.length || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-700" />
            <h3 className="font-semibold text-gray-900">Registrations</h3>
          </div>
          {isOwner && accessType === 'approval' && (
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setTab('attendees')}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${tab === 'attendees' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                Approved <span className="ml-1 bg-gray-200 text-gray-600 rounded-full px-1.5 text-xs">{attendees?.length || 0}</span>
              </button>
              <button
                onClick={() => setTab('pending')}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${tab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                Pending {pendingCount > 0 && <span className="ml-1 bg-orange-100 text-orange-700 rounded-full px-1.5 text-xs">{pendingCount}</span>}
              </button>
            </div>
          )}
        </div>
        {!isOwner || accessType !== 'approval' ? (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {attendees?.length || 0}
          </span>
        ) : null}
      </div>

      {/* Invite link section for invite_only events */}
      {isOwner && accessType === 'invite_only' && inviteCode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-xs font-medium text-blue-800 mb-2">Invite Link — only people with this link can register</p>
          <div className="flex gap-2">
            <code className="flex-1 text-xs bg-white border border-blue-200 rounded px-2 py-1.5 text-blue-700 truncate">
              {`${typeof window !== 'undefined' ? window.location.origin : ''}/events/${eventId}?code=${inviteCode}`}
            </code>
            <button onClick={copyInviteLink} className="flex items-center gap-1 text-xs bg-blue-700 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-800 transition-colors shrink-0">
              <Copy size={12} /> Copy
            </button>
            <button onClick={() => regen.mutate()} disabled={regen.isPending} className="p-1.5 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-blue-600" title="Regenerate">
              <RefreshCw size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Attendees list */}
      {tab === 'attendees' && (
        <>
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
                          Team: {a.team_name}{a.team_members?.length ? ` · ${a.team_members.join(', ')}` : ''}
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
        </>
      )}

      {/* Pending requests */}
      {tab === 'pending' && (
        <>
          {!pending?.length ? (
            <p className="text-sm text-gray-400">No pending requests.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {pending.map((a: any) => (
                <div key={a.user_id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {a.avatar_url ? (
                      <img src={a.avatar_url} className="w-8 h-8 rounded-full object-cover shrink-0" alt={a.name} />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {a.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{a.name}</p>
                      <p className="text-xs text-gray-400 truncate">{a.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => review.mutate({ userId: a.user_id, action: 'approve' })}
                      disabled={review.isPending}
                      className="flex items-center gap-1 text-xs bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      <Check size={12} /> Approve
                    </button>
                    <button
                      onClick={() => review.mutate({ userId: a.user_id, action: 'reject' })}
                      disabled={review.isPending}
                      className="flex items-center gap-1 text-xs border border-red-200 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      <X size={12} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
