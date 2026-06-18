'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Users, Crown, ChevronDown, ChevronUp, UserPlus, Trophy, Lock,
  Send, Check, X, ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useMyTeams, useOpenTeams, useEventTeams, useRegisterTeam, useRequestToJoin,
} from '@/hooks/useTeams';
import { useAuthStore } from '@/store/auth.store';

interface Member { user_id: string; name: string; avatar_url?: string; role: string; }
interface Team {
  team_id: string; name: string; description?: string;
  leader_id: string; leader_name?: string; leader_avatar?: string;
  join_requests_open?: boolean; member_count?: number;
  members?: Member[] | null;
  is_member?: boolean; has_pending_request?: boolean;
  registered_at?: string;
}

function Avatar({ name, url, size = 8 }: { name: string; url?: string; size?: number }) {
  const cls = `w-${size} h-${size}`;
  return url ? (
    <img src={url} alt={name} className={`${cls} rounded-full object-cover shrink-0 border-2 border-white`} />
  ) : (
    <div className={`${cls} rounded-full bg-violet-700 flex items-center justify-center text-xs font-bold text-white shrink-0 border-2 border-white`}>
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

function TeamDetailModal({ team, onClose, onRequestJoin, requesting }: {
  team: Team; onClose: () => void;
  onRequestJoin: (teamId: string, message?: string) => void;
  requesting: boolean;
}) {
  const [message, setMessage] = useState('');
  const members = team.members || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-800 to-violet-600 flex items-center justify-center shrink-0">
              <Users size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{team.name}</h3>
              {team.leader_name && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Crown size={10} className="text-amber-500" /> {team.leader_name}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {team.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{team.description}</p>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Members ({members.length})
            </p>
            <div className="space-y-2">
              {members.map(m => (
                <div key={m.user_id} className="flex items-center gap-2.5">
                  <Avatar name={m.name} url={m.avatar_url} size={8} />
                  <span className="text-sm text-gray-900">{m.name}</span>
                  {m.user_id === team.leader_id && (
                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md">Leader</span>
                  )}
                  {m.role && m.role !== 'member' && m.role !== 'leader' && (
                    <span className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-1.5 py-0.5 rounded-md">{m.role}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {!team.is_member && team.join_requests_open !== false && !team.has_pending_request && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Message (optional)</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tell the leader why you'd like to join..."
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 resize-none"
              />
              <button
                onClick={() => onRequestJoin(team.team_id, message.trim() || undefined)}
                disabled={requesting}
                className="mt-2 w-full flex items-center justify-center gap-1.5 bg-violet-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-violet-900 disabled:opacity-50 transition-colors"
              >
                <Send size={14} />
                {requesting ? 'Sending...' : 'Request to join'}
              </button>
            </div>
          )}

          {team.has_pending_request && (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Your join request is pending approval.
            </p>
          )}

          {team.is_member && (
            <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 flex items-center gap-1.5">
              <Check size={14} /> You are a member of this team
            </p>
          )}

          {team.join_requests_open === false && !team.is_member && (
            <p className="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 flex items-center gap-1.5">
              <Lock size={14} /> This team is not accepting join requests
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function EventTeamSection({ eventId, isApproval }: { eventId: string; isApproval: boolean }) {
  const { user } = useAuthStore();
  const { data: myTeams = [] } = useMyTeams();
  const { data: eventTeams = [], isLoading: loadingEventTeams } = useEventTeams(eventId);
  const { data: openTeams = [] } = useOpenTeams(!!user);
  const register = useRegisterTeam();
  const requestJoin = useRequestToJoin();

  const [showBrowse, setShowBrowse] = useState(false);
  const [detailTeam, setDetailTeam] = useState<Team | null>(null);

  const myTeamIds = new Set((myTeams as Team[]).map(t => t.team_id));
  const registeredTeamIds = new Set((eventTeams as Team[]).map(t => t.team_id));
  const availableMyTeams = (myTeams as Team[]).filter(t => !registeredTeamIds.has(t.team_id));
  const browseTeams = (openTeams as Team[]).filter(t => !myTeamIds.has(t.team_id));

  const handleRegisterTeam = async (teamId: string) => {
    try {
      const r = await register.mutateAsync({ teamId, eventId });
      toast.success(r.message || 'Team registered!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleRequestJoin = async (teamId: string, message?: string) => {
    try {
      await requestJoin.mutateAsync({ teamId, message });
      toast.success('Join request sent!');
      setDetailTeam(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send request');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* Register with your team */}
      {availableMyTeams.length > 0 && (
        <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
          <p className="text-xs font-semibold text-violet-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Users size={12} /> Your teams
          </p>
          <div className="space-y-2">
            {availableMyTeams.map(team => {
              const isLeader = team.leader_id === user.user_id;
              const members = team.members || [];
              return (
                <div key={team.team_id} className="flex items-center gap-3 bg-white rounded-lg border border-violet-100 p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{team.name}</p>
                    <p className="text-xs text-gray-400">{members.length} member{members.length !== 1 ? 's' : ''}</p>
                  </div>
                  {isLeader ? (
                    <button
                      onClick={() => handleRegisterTeam(team.team_id)}
                      disabled={register.isPending}
                      className="text-xs bg-violet-800 text-white px-3 py-1.5 rounded-lg hover:bg-violet-900 disabled:opacity-50 transition-colors shrink-0"
                    >
                      {register.isPending ? '...' : isApproval ? 'Request' : 'Register'}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">Leader only</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {availableMyTeams.length === 0 && myTeamIds.size === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-500 mb-2">No team yet?</p>
          <Link href="/teams" className="text-sm text-violet-700 font-medium hover:underline flex items-center justify-center gap-1">
            Create a team <ExternalLink size={12} />
          </Link>
        </div>
      )}

      {/* Browse open teams */}
      <button
        onClick={() => setShowBrowse(v => !v)}
        className="w-full flex items-center justify-between text-sm text-violet-800 border border-violet-200 hover:border-violet-400 hover:bg-violet-50 px-4 py-2.5 rounded-lg transition-colors font-medium"
      >
        <span className="flex items-center gap-1.5"><UserPlus size={14} /> Browse teams & request to join</span>
        {showBrowse ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {showBrowse && (
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 space-y-2 max-h-64 overflow-y-auto">
          {browseTeams.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No teams available to join</p>
          ) : (
            browseTeams.map(team => (
              <div key={team.team_id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 p-3 hover:border-violet-200 transition-colors">
                <div className="flex -space-x-1.5 shrink-0">
                  {(team.members || []).slice(0, 3).map(m => (
                    <Avatar key={m.user_id} name={m.name} url={m.avatar_url} size={7} />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{team.name}</p>
                  <p className="text-xs text-gray-400">
                    {team.member_count ?? (team.members?.length || 0)} members
                    {team.join_requests_open === false && (
                      <span className="ml-1.5 text-gray-400"><Lock size={10} className="inline" /> closed</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setDetailTeam(team)}
                  className="text-xs text-violet-700 border border-violet-200 px-2.5 py-1 rounded-lg hover:bg-violet-50 transition-colors shrink-0"
                >
                  View
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Registered teams for this event */}
      {!loadingEventTeams && (eventTeams as Team[]).length > 0 && (
        <div className="rounded-xl border border-orange-100 bg-orange-50/30 p-4">
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Trophy size={12} /> Registered teams ({(eventTeams as Team[]).length})
          </p>
          <div className="space-y-2">
            {(eventTeams as Team[]).map(team => (
              <button
                key={team.team_id}
                onClick={() => setDetailTeam({ ...team, is_member: myTeamIds.has(team.team_id) })}
                className="w-full flex items-center gap-3 bg-white rounded-lg border border-orange-100 p-3 hover:border-orange-200 transition-colors text-left"
              >
                <div className="flex -space-x-1.5 shrink-0">
                  {(team.members || []).slice(0, 4).map(m => (
                    <Avatar key={m.user_id} name={m.name} url={m.avatar_url} size={7} />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{team.name}</p>
                  <p className="text-xs text-gray-400">
                    {(team.members || []).length} members · {team.leader_name}
                  </p>
                </div>
                <ChevronDown size={14} className="text-gray-300 shrink-0 rotate-[-90deg]" />
              </button>
            ))}
          </div>
        </div>
      )}

      {detailTeam && (
        <TeamDetailModal
          team={detailTeam}
          onClose={() => setDetailTeam(null)}
          onRequestJoin={handleRequestJoin}
          requesting={requestJoin.isPending}
        />
      )}
    </div>
  );
}
