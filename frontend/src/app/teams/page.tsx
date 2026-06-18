'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
  useMyTeams, useCreateTeam, useAddMember, useRemoveMember,
  useDeleteTeam, useAvailableHackathons, useRegisterTeam, useUpdateMemberRole,
  useLeaveTeam, useUpdateTeamSettings, useMyInvites, useAcceptInvite, useDeclineInvite,
  useJoinRequests, useAcceptJoinRequest, useDeclineJoinRequest, useOpenTeams, useRequestToJoin,
} from '@/hooks/useTeams';
import {
  Plus, X, UserPlus, Trash2, Trophy, Crown, Users,
  ChevronDown, ChevronUp, Calendar, MapPin, Pencil, Check,
  LogOut, Mail, Lock, Unlock, Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Link from 'next/link';

const ROLES = [
  'Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Designer',
  'UI/UX Designer',
  'Product Manager',
  'Data Scientist',
  'DevOps / SRE',
  'Business Analyst',
  'Mentor',
  'Other',
];

interface Member { user_id: string; name: string; avatar_url?: string; role: string; }
interface Hackathon { event_id: string; title: string; date?: string; location?: string; cover_image?: string; }
interface Team {
  team_id: string; name: string; description?: string;
  leader_id: string; my_role: string;
  join_requests_open?: boolean;
  members: Member[] | null;
  hackathons: Hackathon[] | null;
}

function MemberAvatar({ m, size = 8 }: { m: Member; size?: number }) {
  const s = `w-${size} h-${size}`;
  return (
    <div className={`${s} rounded-full bg-violet-800 flex items-center justify-center text-xs font-bold text-white overflow-hidden border-2 border-white shrink-0`}>
      {m.avatar_url
        ? <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover" />
        : m.name?.[0]?.toUpperCase()
      }
    </div>
  );
}

function RoleTag({ role, isLeader }: { role: string; isLeader: boolean }) {
  if (isLeader) return (
    <span className="flex items-center gap-0.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md">
      <Crown size={10} /> Team Leader
    </span>
  );
  if (!role || role === 'member') return null;
  return (
    <span className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-1.5 py-0.5 rounded-md">{role}</span>
  );
}

function HackathonPicker({ teamId, onClose }: { teamId: string; onClose: () => void }) {
  const { data: hackathons = [], isLoading } = useAvailableHackathons(true);
  const register = useRegisterTeam();

  const handle = async (eventId: string) => {
    try {
      const r = await register.mutateAsync({ teamId, eventId });
      toast.success(r.message);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to register');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-orange-500" />
            <h3 className="font-semibold text-gray-900">Join a Hackathon</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {isLoading && [1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
          {!isLoading && hackathons.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">No upcoming hackathons available</p>
          )}
          {(hackathons as Hackathon[]).map(h => (
            <div key={h.event_id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50 transition-all">
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-purple-700 to-violet-900">
                {h.cover_image && <img src={h.cover_image} alt={h.title} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{h.title}</p>
                <p className="text-xs text-gray-400">
                  {h.date ? format(new Date(h.date), 'MMM d, yyyy') : 'TBD'}
                  {h.location ? ` · ${h.location}` : ''}
                </p>
              </div>
              <button
                onClick={() => handle(h.event_id)}
                disabled={register.isPending}
                className="text-xs bg-violet-800 text-white px-3 py-1.5 rounded-lg hover:bg-violet-900 disabled:opacity-50 transition-colors shrink-0"
              >Register</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoleEditor({ teamId, member, onDone }: { teamId: string; member: Member; onDone: () => void }) {
  const [selected, setSelected] = useState(member.role === 'member' ? '' : member.role);
  const update = useUpdateMemberRole();

  const save = async (role: string) => {
    try {
      await update.mutateAsync({ teamId, userId: member.user_id, role: role || 'member' });
      toast.success('Role updated');
      onDone();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 w-48" onClick={e => e.stopPropagation()}>
      {ROLES.map(r => (
        <button
          key={r}
          onClick={() => save(r)}
          className={`w-full text-left text-sm px-3 py-1.5 hover:bg-violet-50 hover:text-violet-800 transition-colors flex items-center justify-between ${selected === r ? 'text-violet-800 font-medium' : 'text-gray-700'}`}
        >
          {r}
          {selected === r && <Check size={12} />}
        </button>
      ))}
    </div>
  );
}

function TeamCard({ team, currentUserId }: { team: Team; currentUserId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showHackathons, setShowHackathons] = useState(false);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const [editingRoleFor, setEditingRoleFor] = useState<string | null>(null);
  const addMember = useAddMember();
  const removeMember = useRemoveMember();
  const deleteTeam = useDeleteTeam();
  const leaveTeam = useLeaveTeam();
  const updateSettings = useUpdateTeamSettings();
  const { data: joinRequests = [] } = useJoinRequests(team.team_id, showJoinRequests);
  const acceptRequest = useAcceptJoinRequest();
  const declineRequest = useDeclineJoinRequest();
  const isLeader = team.leader_id === currentUserId;
  const members = team.members || [];
  const hackathons = team.hackathons || [];
  const joinOpen = team.join_requests_open !== false;

  const handleAdd = async () => {
    if (!addEmail.trim()) return;
    try {
      await addMember.mutateAsync({ teamId: team.team_id, email: addEmail.trim() });
      toast.success('Invite sent');
      setAddEmail(''); setShowAdd(false);
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleLeave = async () => {
    if (!confirm(`Leave team "${team.name}"?`)) return;
    try {
      await leaveTeam.mutateAsync(team.team_id);
      toast.success('Left team');
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const toggleJoinRequests = async () => {
    try {
      await updateSettings.mutateAsync({ teamId: team.team_id, join_requests_open: !joinOpen });
      toast.success(joinOpen ? 'Join requests closed' : 'Join requests opened');
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleRemove = async (m: Member) => {
    if (!confirm(`Remove ${m.name}?`)) return;
    try {
      await removeMember.mutateAsync({ teamId: team.team_id, userId: m.user_id });
      toast.success('Member removed');
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete team "${team.name}"?`)) return;
    try {
      await deleteTeam.mutateAsync(team.team_id);
      toast.success('Team deleted');
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" onClick={() => editingRoleFor && setEditingRoleFor(null)}>
        {/* Header */}
        <button
          className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-800 to-violet-600 flex items-center justify-center shrink-0">
            <Users size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{team.name}</span>
              {isLeader && (
                <span className="flex items-center gap-0.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md">
                  <Crown size={10} /> Leader
                </span>
              )}
              <span className="text-xs text-gray-400">{members.length} member{members.length !== 1 ? 's' : ''}</span>
              {hackathons.length > 0 && (
                <span className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  <Trophy size={9} /> {hackathons.length} hackathon{hackathons.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {team.description && <p className="text-xs text-gray-500 truncate mt-0.5">{team.description}</p>}
          </div>
          <div className="flex -space-x-1.5 shrink-0 mx-2">
            {members.slice(0, 5).map(m => <MemberAvatar key={m.user_id} m={m} size={7} />)}
            {members.length > 5 && (
              <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-500 font-medium">
                +{members.length - 5}
              </div>
            )}
          </div>
          {expanded ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
        </button>

        {expanded && (
          <div className="border-t border-gray-100">
            {/* Members */}
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Members</p>
              <div className="space-y-2.5">
                {members.map(m => {
                  const isMemberLeader = m.user_id === team.leader_id;
                  return (
                    <div key={m.user_id} className="flex items-center gap-3">
                      <MemberAvatar m={m} size={9} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{m.name}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <RoleTag role={m.role} isLeader={isMemberLeader} />
                        {/* Role edit button — only for non-leader members, only leader can edit */}
                        {isLeader && !isMemberLeader && (
                          <div className="relative">
                            <button
                              onClick={e => { e.stopPropagation(); setEditingRoleFor(editingRoleFor === m.user_id ? null : m.user_id); }}
                              className="text-gray-300 hover:text-violet-600 transition-colors"
                              title="Change role"
                            >
                              <Pencil size={13} />
                            </button>
                            {editingRoleFor === m.user_id && (
                              <RoleEditor
                                teamId={team.team_id}
                                member={m}
                                onDone={() => setEditingRoleFor(null)}
                              />
                            )}
                          </div>
                        )}
                        {isLeader && !isMemberLeader && (
                          <button onClick={() => handleRemove(m)} className="text-gray-300 hover:text-red-500 transition-colors" title="Remove">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Registered Hackathons */}
            {hackathons.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Trophy size={11} className="text-orange-400" /> Registered Hackathons
                </p>
                <div className="space-y-2">
                  {hackathons.map(h => (
                    <Link
                      key={h.event_id}
                      href={`/events/${h.event_id}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-orange-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-purple-700 to-violet-900">
                        {h.cover_image && <img src={h.cover_image} alt={h.title} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-violet-800 truncate transition-colors">{h.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          {h.date && <span className="flex items-center gap-1"><Calendar size={10} />{format(new Date(h.date), 'MMM d, yyyy')}</span>}
                          {h.location && <span className="flex items-center gap-1"><MapPin size={10} />{h.location}</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Join requests (leader only) */}
            {isLeader && (
              <div className="border-t border-gray-100 px-5 py-4">
                <button
                  onClick={() => setShowJoinRequests(v => !v)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-violet-700 transition-colors"
                >
                  <Mail size={11} /> Join Requests
                  {showJoinRequests ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {showJoinRequests && (
                  <div className="mt-3 space-y-2">
                    {(joinRequests as any[]).length === 0 ? (
                      <p className="text-xs text-gray-400">No pending requests</p>
                    ) : (
                      (joinRequests as any[]).map(req => (
                        <div key={req.request_id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                          <MemberAvatar m={{ user_id: req.user_id, name: req.name, avatar_url: req.avatar_url, role: 'member' }} size={8} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{req.name}</p>
                            {req.message && <p className="text-xs text-gray-500 truncate">{req.message}</p>}
                          </div>
                          <button
                            onClick={() => acceptRequest.mutate(req.request_id, { onSuccess: () => toast.success('Accepted') })}
                            className="text-emerald-600 hover:bg-emerald-50 p-1 rounded transition-colors"
                            title="Accept"
                          ><Check size={14} /></button>
                          <button
                            onClick={() => declineRequest.mutate(req.request_id, { onSuccess: () => toast.success('Declined') })}
                            className="text-red-400 hover:bg-red-50 p-1 rounded transition-colors"
                            title="Decline"
                          ><X size={14} /></button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-gray-100 px-5 py-3 flex flex-wrap gap-2">
              {isLeader && (
                <button
                  onClick={toggleJoinRequests}
                  disabled={updateSettings.isPending}
                  className={`flex items-center gap-1.5 text-sm border px-3 py-1.5 rounded-lg transition-colors ${
                    joinOpen
                      ? 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                      : 'text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}
                  title={joinOpen ? 'Close join requests' : 'Open join requests'}
                >
                  {joinOpen ? <Unlock size={13} /> : <Lock size={13} />}
                  {joinOpen ? 'Join open' : 'Join closed'}
                </button>
              )}
              {isLeader && !showAdd && (
                <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 text-sm text-violet-700 border border-violet-200 hover:border-violet-400 hover:bg-violet-50 px-3 py-1.5 rounded-lg transition-colors">
                  <UserPlus size={13} /> Send invite
                </button>
              )}
              {isLeader && showAdd && (
                <div className="flex gap-2 w-full">
                  <input
                    value={addEmail}
                    onChange={e => setAddEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    placeholder="Invite by email..."
                    autoFocus
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 bg-white"
                  />
                  <button onClick={handleAdd} disabled={addMember.isPending} className="px-3 py-2 bg-violet-800 text-white rounded-lg text-sm hover:bg-violet-900 disabled:opacity-50 transition-colors">
                    {addMember.isPending ? '...' : 'Send'}
                  </button>
                  <button onClick={() => { setShowAdd(false); setAddEmail(''); }} className="px-2 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <X size={14} className="text-gray-500" />
                  </button>
                </div>
              )}
              <button onClick={() => setShowHackathons(true)} className="flex items-center gap-1.5 text-sm text-orange-600 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors">
                <Trophy size={13} /> Join Hackathon
              </button>
              {!isLeader && (
                <button onClick={handleLeave} className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-lg transition-colors">
                  <LogOut size={13} /> Leave team
                </button>
              )}
              {isLeader && (
                <button onClick={handleDelete} className="ml-auto flex items-center gap-1.5 text-sm text-red-400 border border-red-100 hover:border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                  <Trash2 size={13} /> Delete team
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showHackathons && <HackathonPicker teamId={team.team_id} onClose={() => setShowHackathons(false)} />}
    </>
  );
}

function CreateTeamModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const create = useCreateTeam();

  const handle = async () => {
    if (!name.trim()) { toast.error('Name required'); return; }
    try {
      await create.mutateAsync({ name: name.trim(), description: desc.trim() || undefined });
      toast.success('Team created!');
      onClose();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Users size={16} className="text-violet-700" /> Create Team</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()}
            placeholder="Team name *" autoFocus
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 bg-white" />
          <textarea value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Short description (optional)" rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 bg-white resize-none" />
          <button onClick={handle} disabled={create.isPending}
            className="w-full bg-violet-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-violet-900 disabled:opacity-50 transition-colors">
            {create.isPending ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeamsPage() {
  const { user, _hasHydrated } = useAuthStore();
  const { data: teams = [], isLoading } = useMyTeams();
  const { data: invites = [] } = useMyInvites();
  const { data: openTeams = [] } = useOpenTeams();
  const acceptInvite = useAcceptInvite();
  const declineInvite = useDeclineInvite();
  const requestJoin = useRequestToJoin();
  const [showCreate, setShowCreate] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [browseDetail, setBrowseDetail] = useState<any>(null);
  const [joinMessage, setJoinMessage] = useState('');

  const myTeamIds = new Set((teams as Team[]).map(t => t.team_id));
  const browseList = (openTeams as any[]).filter(t => !myTeamIds.has(t.team_id));

  if (!_hasHydrated) return null;
  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-gray-500">Please <Link href="/login" className="text-violet-700 font-medium">log in</Link> to view your teams.</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={22} className="text-violet-700" /> My Teams
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Collaborate and join hackathons together</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 bg-violet-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-900 transition-colors"
        >
          <Plus size={15} /> New Team
        </button>
      </div>

      {/* Pending invites */}
      {(invites as any[]).length > 0 && (
        <div className="mb-6 rounded-xl border border-violet-200 bg-violet-50/50 p-4">
          <p className="text-xs font-semibold text-violet-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Mail size={12} /> Team Invites
          </p>
          <div className="space-y-2">
            {(invites as any[]).map(inv => (
              <div key={inv.invite_id} className="flex items-center gap-3 bg-white rounded-lg border border-violet-100 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{inv.team_name}</p>
                  <p className="text-xs text-gray-400">
                    Invited by {inv.invited_by_name} · {inv.member_count} members
                  </p>
                </div>
                <button
                  onClick={() => acceptInvite.mutate(inv.invite_id, { onSuccess: () => toast.success('Joined team!') })}
                  disabled={acceptInvite.isPending}
                  className="text-xs bg-violet-800 text-white px-3 py-1.5 rounded-lg hover:bg-violet-900 disabled:opacity-50 transition-colors"
                >Accept</button>
                <button
                  onClick={() => declineInvite.mutate(inv.invite_id)}
                  className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >Decline</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browse teams */}
      <div className="mb-6">
        <button
          onClick={() => setShowBrowse(v => !v)}
          className="w-full flex items-center justify-between text-sm text-violet-800 border border-violet-200 hover:border-violet-400 hover:bg-violet-50 px-4 py-3 rounded-xl transition-colors font-medium"
        >
          <span className="flex items-center gap-1.5"><UserPlus size={14} /> Browse teams & request to join</span>
          {showBrowse ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showBrowse && (
          <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50/50 p-3 space-y-2 max-h-72 overflow-y-auto">
            {browseList.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No teams available</p>
            ) : (
              browseList.map(team => (
                <div key={team.team_id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{team.name}</p>
                    <p className="text-xs text-gray-400">
                      {team.member_count} members · {team.leader_name}
                      {team.join_requests_open === false && ' · closed'}
                    </p>
                  </div>
                  <button
                    onClick={() => { setBrowseDetail(team); setJoinMessage(''); }}
                    className="text-xs text-violet-700 border border-violet-200 px-2.5 py-1 rounded-lg hover:bg-violet-50 transition-colors shrink-0"
                  >View</button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      )}

      {!isLoading && teams.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <Users size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No teams yet</p>
          <p className="text-sm text-gray-400 mt-1">Create a team and join hackathons together</p>
          <button onClick={() => setShowCreate(true)} className="mt-4 bg-violet-800 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-violet-900 transition-colors">
            Create your first team
          </button>
        </div>
      )}

      <div className="space-y-3">
        {(teams as Team[]).map(t => (
          <TeamCard key={t.team_id} team={t} currentUserId={user.user_id} />
        ))}
      </div>

      {showCreate && <CreateTeamModal onClose={() => setShowCreate(false)} />}

      {browseDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setBrowseDetail(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{browseDetail.name}</h3>
              <button onClick={() => setBrowseDetail(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            {browseDetail.description && <p className="text-sm text-gray-600 mb-4">{browseDetail.description}</p>}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Members ({(browseDetail.members || []).length})
            </p>
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {(browseDetail.members || []).map((m: Member) => (
                <div key={m.user_id} className="flex items-center gap-2">
                  <MemberAvatar m={m} size={7} />
                  <span className="text-sm text-gray-900">{m.name}</span>
                </div>
              ))}
            </div>
            {browseDetail.has_pending_request ? (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">Request pending</p>
            ) : browseDetail.join_requests_open !== false ? (
              <>
                <textarea
                  value={joinMessage}
                  onChange={e => setJoinMessage(e.target.value)}
                  placeholder="Message (optional)"
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 resize-none mb-2"
                />
                <button
                  onClick={() => requestJoin.mutate(
                    { teamId: browseDetail.team_id, message: joinMessage.trim() || undefined },
                    { onSuccess: () => { toast.success('Request sent!'); setBrowseDetail(null); } }
                  )}
                  disabled={requestJoin.isPending}
                  className="w-full flex items-center justify-center gap-1.5 bg-violet-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-violet-900 disabled:opacity-50"
                >
                  <Send size={14} /> {requestJoin.isPending ? 'Sending...' : 'Request to join'}
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 flex items-center gap-1.5">
                <Lock size={14} /> Not accepting join requests
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
