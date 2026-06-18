'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Trophy, Award, X, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAttendees } from '@/hooks/useEvents';
import { Badge, ACHIEVEMENT_TYPES, metaFor } from '@/components/Badge';

interface Attendee {
  user_id: string; name: string; avatar_url?: string;
  role?: string; team_name?: string;
}
interface Achievement {
  achievement_id: string; type: string; label?: string; team_name?: string;
  user_id: string; name: string; avatar_url?: string;
}

function useAchievements(eventId: string) {
  return useQuery<Achievement[]>({
    queryKey: ['achievements', eventId],
    queryFn: () => api.get(`/events/${eventId}/achievements`).then(r => r.data),
    enabled: !!eventId,
  });
}

function Avatar({ name, url }: { name: string; url?: string }) {
  return url ? (
    <img src={url} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-violet-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

export function EventCommunity({ eventId, canManage }: { eventId: string; canManage: boolean }) {
  const qc = useQueryClient();
  const { data: attendees = [], isLoading } = useAttendees(eventId);
  const { data: achievements = [] } = useAchievements(eventId);
  const [showAll, setShowAll] = useState(false);

  const PREVIEW_COUNT = 5;
  const attendeeList = attendees as Attendee[];
  const visibleAttendees = showAll ? attendeeList : attendeeList.slice(0, PREVIEW_COUNT);
  const hasMore = attendeeList.length > PREVIEW_COUNT;

  const [awardTarget, setAwardTarget] = useState<Attendee | null>(null);
  const [type, setType] = useState('winner');
  const [label, setLabel] = useState('');

  const award = useMutation({
    mutationFn: (payload: { user_id: string; type: string; label?: string; team_name?: string }) =>
      api.post(`/events/${eventId}/achievements`, payload).then(r => r.data),
    onSuccess: () => {
      toast.success('Badge awarded');
      qc.invalidateQueries({ queryKey: ['achievements', eventId] });
      setAwardTarget(null);
      setLabel('');
      setType('winner');
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed to award'),
  });

  const remove = useMutation({
    mutationFn: (achievementId: string) =>
      api.delete(`/events/${eventId}/achievements/${achievementId}`).then(r => r.data),
    onSuccess: () => {
      toast.success('Badge removed');
      qc.invalidateQueries({ queryKey: ['achievements', eventId] });
    },
  });

  const submitAward = () => {
    if (!awardTarget) return;
    award.mutate({
      user_id: awardTarget.user_id,
      type,
      label: label.trim() || undefined,
      team_name: awardTarget.team_name || undefined,
    });
  };

  // Map achievements by user for quick lookup
  const badgesByUser = achievements.reduce<Record<string, Achievement[]>>((acc, a) => {
    (acc[a.user_id] ||= []).push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Winners / Achievements */}
      {achievements.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" /> Winners & Achievements
          </h2>
          <div className="space-y-2">
            {achievements.map(a => {
              const m = metaFor(a.type);
              const Icon = m.icon;
              return (
                <div key={a.achievement_id} className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${m.ring}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
                      <Icon size={20} className={m.iconColor} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${m.text}`}>{a.label || m.name}</p>
                      <Link href={`/users/${a.user_id}`} className="text-xs text-gray-600 hover:text-violet-700 hover:underline">
                        {a.name}{a.team_name ? ` · ${a.team_name}` : ''}
                      </Link>
                    </div>
                  </div>
                  {canManage && (
                    <button
                      onClick={() => remove.mutate(a.achievement_id)}
                      className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-1"
                      title="Remove badge"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Community */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users size={18} className="text-violet-600" /> Community
          <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">{attendees.length}</span>
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : attendees.length === 0 ? (
          <p className="text-sm text-gray-400">No one has joined yet. Be the first!</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {visibleAttendees.map(a => (
                <div key={a.user_id} className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 p-2.5 hover:border-violet-200 hover:bg-violet-50/30 transition-colors">
                  <Link href={`/users/${a.user_id}`} className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={a.name} url={a.avatar_url} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate hover:text-violet-700">{a.name}</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {a.team_name && <span className="text-xs text-violet-600">{a.team_name}</span>}
                        {badgesByUser[a.user_id]?.slice(0, 1).map(b => (
                          <Badge key={b.achievement_id} type={b.type} label={b.label} />
                        ))}
                      </div>
                    </div>
                  </Link>
                  {canManage && (
                    <button
                      onClick={() => setAwardTarget(a)}
                      className="flex items-center gap-1 text-xs text-violet-700 border border-violet-200 px-2 py-1 rounded-lg hover:bg-violet-50 transition-colors shrink-0"
                      title="Award a badge"
                    >
                      <Award size={12} /> Award
                    </button>
                  )}
                </div>
              ))}
            </div>
            {hasMore && (
              <button
                onClick={() => setShowAll(v => !v)}
                className="mt-3 w-full text-sm text-violet-700 border border-violet-200 hover:bg-violet-50 py-2 rounded-lg transition-colors font-medium"
              >
                {showAll ? 'Show less' : `Show all ${attendeeList.length} participants`}
              </button>
            )}
          </>
        )}
      </section>

      {/* Award modal */}
      {awardTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setAwardTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Award badge</h3>
              <button onClick={() => setAwardTarget(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="flex items-center gap-2.5 mb-4 p-2.5 bg-gray-50 rounded-lg">
              <Avatar name={awardTarget.name} url={awardTarget.avatar_url} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{awardTarget.name}</p>
                {awardTarget.team_name && <p className="text-xs text-violet-600">{awardTarget.team_name}</p>}
              </div>
            </div>

            <label className="block text-xs font-medium text-gray-700 mb-1.5">Achievement</label>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {ACHIEVEMENT_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`text-xs px-2.5 py-2 rounded-lg border font-medium transition-colors ${
                    type === t.value ? 'border-violet-500 bg-violet-50 text-violet-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Custom label <span className="text-gray-400 font-normal">(optional — overrides preset text)</span>
            </label>
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder='e.g. Best UI, Audience Favorite'
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={submitAward}
                disabled={award.isPending}
                className="flex-1 bg-violet-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-violet-800 disabled:opacity-50 transition-colors"
              >
                {award.isPending ? 'Awarding...' : 'Award badge'}
              </button>
              <button onClick={() => setAwardTarget(null)} className="px-4 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
