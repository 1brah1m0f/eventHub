'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
  useMyTeams, useCreateTeam, useAddMember,
  useRemoveMember, useDeleteTeam, useAvailableHackathons, useRegisterTeam,
} from '@/hooks/useTeams';
import { Plus, X, UserPlus, Trash2, Trophy, Crown, Users, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Member {
  user_id: string;
  name: string;
  avatar_url?: string;
  role: 'leader' | 'member';
}

interface Team {
  team_id: string;
  name: string;
  description?: string;
  leader_id: string;
  my_role: 'leader' | 'member';
  members: Member[] | null;
}

interface Hackathon {
  event_id: string;
  title: string;
  date?: string;
  location?: string;
  cover_image?: string;
}

function Avatar({ member, size = 'sm' }: { member: Member; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div className={`${sz} rounded-full bg-blue-800 flex items-center justify-center font-bold text-white overflow-hidden shrink-0 border-2 border-white`}>
      {member.avatar_url
        ? <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
        : member.name?.[0]?.toUpperCase()
      }
    </div>
  );
}

function HackathonPicker({ teamId, onClose }: { teamId: string; onClose: () => void }) {
  const { data: hackathons = [], isLoading } = useAvailableHackathons(true);
  const registerTeam = useRegisterTeam();

  const handleRegister = async (eventId: string, title: string) => {
    try {
      const result = await registerTeam.mutateAsync({ teamId, eventId });
      toast.success(`${result.message}`);
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {isLoading && (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          )}
          {!isLoading && hackathons.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">No upcoming hackathons available</p>
          )}
          {hackathons.map((h: Hackathon) => (
            <div key={h.event_id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group">
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-purple-700 to-blue-900">
                {h.cover_image && <img src={h.cover_image} alt={h.title} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{h.title}</p>
                <p className="text-xs text-gray-400">
                  {h.date ? format(new Date(h.date), 'MMM d, yyyy') : 'Date TBD'}
                  {h.location ? ` · ${h.location}` : ''}
                </p>
              </div>
              <button
                onClick={() => handleRegister(h.event_id, h.title)}
                disabled={registerTeam.isPending}
                className="text-xs bg-blue-800 text-white px-3 py-1.5 rounded-lg hover:bg-blue-900 disabled:opacity-50 transition-colors shrink-0"
              >
                Register
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamCard({ team, currentUserId }: { team: Team; currentUserId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showHackathons, setShowHackathons] = useState(false);
  const addMember = useAddMember();
  const removeMember = useRemoveMember();
  const deleteTeam = useDeleteTeam();
  const isLeader = team.my_role === 'leader';
  const members = team.members || [];

  const handleAddMember = async () => {
    if (!addEmail.trim()) return;
    try {
      await addMember.mutateAsync({ teamId: team.team_id, email: addEmail.trim() });
      toast.success('Member added');
      setAddEmail('');
      setShowAdd(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add member');
    }
  };

  const handleRemove = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from the team?`)) return;
    try {
      await removeMember.mutateAsync({ teamId: team.team_id, userId });
      toast.success('Member removed');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to remove');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete team "${team.name}"? This cannot be undone.`)) return;
    try {
      await deleteTeam.mutateAsync(team.team_id);
      toast.success('Team deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center shrink-0">
            <Users size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{team.name}</h3>
              {isLeader && (
                <span className="flex items-center gap-0.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md shrink-0">
                  <Crown size={10} /> Leader
                </span>
              )}
            </div>
            {team.description && <p className="text-xs text-gray-500 truncate mt-0.5">{team.description}</p>}
          </div>

          {/* Stacked avatars */}
          <div className="flex -space-x-2 shrink-0">
            {members.slice(0, 4).map(m => <Avatar key={m.user_id} member={m} />)}
            {members.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600 font-medium">
                +{members.length - 4}
              </div>
            )}
          </div>

          <button onClick={() => setExpanded(e => !e)} className="text-gray-400 hover:text-gray-600 transition-colors ml-1">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Expanded */}
        {expanded && (
          <div className="border-t border-gray-100 px-4 py-3 space-y-3">
            {/* Members list */}
            <div className="space-y-2">
              {members.map(m => (
                <div key={m.user_id} className="flex items-center gap-2.5">
                  <Avatar member={m} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                  </div>
                  {m.role === 'leader' && (
                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <Crown size={10} /> Leader
                    </span>
                  )}
                  {isLeader && m.user_id !== currentUserId && (
                    <button
                      onClick={() => handleRemove(m.user_id, m.name)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                      title="Remove member"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add member (leader only) */}
            {isLeader && (
              <>
                {showAdd ? (
                  <div className="flex gap-2">
                    <input
                      value={addEmail}
                      onChange={e => setAddEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                      placeholder="Email address..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 bg-white"
                      autoFocus
                    />
                    <button
                      onClick={handleAddMember}
                      disabled={addMember.isPending}
                      className="px-3 py-2 bg-blue-800 text-white rounded-lg text-sm hover:bg-blue-900 disabled:opacity-50 transition-colors"
                    >
                      {addMember.isPending ? '...' : 'Add'}
                    </button>
                    <button onClick={() => { setShowAdd(false); setAddEmail(''); }} className="px-2 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <X size={14} className="text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAdd(true)}
                      className="flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <UserPlus size={13} /> Add member
                    </button>
                    <button
                      onClick={() => setShowHackathons(true)}
                      className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-800 border border-orange-200 hover:border-orange-400 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Trophy size={13} /> Join Hackathon
                    </button>
                    <button
                      onClick={handleDelete}
                      className="ml-auto flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
              </>
            )}

            {!isLeader && (
              <button
                onClick={() => setShowHackathons(true)}
                className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-800 border border-orange-200 hover:border-orange-400 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trophy size={13} /> Join Hackathon as Team
              </button>
            )}
          </div>
        )}
      </div>

      {showHackathons && (
        <HackathonPicker teamId={team.team_id} onClose={() => setShowHackathons(false)} />
      )}
    </>
  );
}

function CreateTeamModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createTeam = useCreateTeam();

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('Team name required'); return; }
    try {
      await createTeam.mutateAsync({ name: name.trim(), description: description.trim() || undefined });
      toast.success('Team created!');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create team');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Create Team</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Team name *"
            autoFocus
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 bg-white"
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Short description (optional)"
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 bg-white resize-none"
          />
          <button
            onClick={handleCreate}
            disabled={createTeam.isPending}
            className="w-full bg-blue-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-900 disabled:opacity-50 transition-colors"
          >
            {createTeam.isPending ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TeamsSection() {
  const { user } = useAuthStore();
  const { data: teams = [], isLoading } = useMyTeams();
  const [showCreate, setShowCreate] = useState(false);

  if (!user) return null;

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">My Teams</h2>
          {teams.length > 0 && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{teams.length}</span>
          )}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 text-sm bg-blue-800 text-white px-3 py-1.5 rounded-lg hover:bg-blue-900 transition-colors"
        >
          <Plus size={14} /> New Team
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      )}

      {!isLoading && teams.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center">
          <Users size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No teams yet</p>
          <p className="text-xs text-gray-400 mt-0.5">Create a team to join hackathons together</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-3 text-sm text-blue-700 hover:text-blue-900 font-medium"
          >
            Create your first team →
          </button>
        </div>
      )}

      <div className="space-y-3">
        {teams.map((team: Team) => (
          <TeamCard key={team.team_id} team={team} currentUserId={user.user_id} />
        ))}
      </div>

      {showCreate && <CreateTeamModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
