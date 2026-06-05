'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEvent, useRegisterForEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useEvents';
import { useAuthStore } from '@/store/auth.store';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Pencil, Trash2, Globe, CheckCircle2, ArrowLeft, Plus, X, Lock, Clock, Share2, Link2, Check } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { EVENT_TYPES } from '@/lib/utils';
import { QASection } from '@/components/QASection';
import { StaffManagement } from '@/components/StaffManagement';
import { AttendeesPanel } from '@/components/AttendeesPanel';
import { EventCarousel } from '@/components/EventCarousel';
import { useState } from 'react';

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  hackathon:   { bg: 'bg-purple-100', text: 'text-purple-700' },
  conference:  { bg: 'bg-blue-100',   text: 'text-blue-800'   },
  workshop:    { bg: 'bg-emerald-100', text: 'text-emerald-700'},
  bootcamp:    { bg: 'bg-orange-100', text: 'text-orange-700' },
  meetup:      { bg: 'bg-pink-100',   text: 'text-pink-700'   },
  networking:  { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  competition: { bg: 'bg-red-100',    text: 'text-red-700'    },
  demo_day:    { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  seminar:     { bg: 'bg-teal-100',   text: 'text-teal-700'   },
};

const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 bg-white';

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const searchParams = useSearchParams();
  const inviteCodeParam = searchParams.get('code');
  const { data: event, isLoading } = useEvent(eventId);
  const { user } = useAuthStore();
  const router = useRouter();
  const registerMutation = useRegisterForEvent(eventId);
  const updateEvent = useUpdateEvent(eventId);
  const deleteEvent = useDeleteEvent();

  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4 animate-pulse">
      <div className="h-64 bg-gray-200 rounded-xl" />
      <div className="h-8 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </div>
  );

  if (!event) return (
    <div className="text-center py-24 text-gray-500">
      <p className="text-lg mb-2">Event not found</p>
      <Link href="/events" className="text-sm text-blue-700 hover:underline">Back to events</Link>
    </div>
  );

  const isOwner = event.viewer_role === 'owner';
  const isStaff = event.viewer_role === 'staff';
  const canEdit = isOwner || isStaff;
  const typeLabel = EVENT_TYPES.find(t => t.value === event.type)?.label || event.type;
  const colors = TYPE_COLORS[event.type] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  const totalAttendees = event.registration_counts?.reduce((sum: number, r: any) => sum + parseInt(r.count), 0) || 0;
  const isHackathon = event.type === 'hackathon' || event.type === 'competition';
  const accessType = event.access_type || 'public';
  const isApproval = accessType === 'approval';
  const isInviteOnly = accessType === 'invite_only';
  const hasValidInvite = isInviteOnly && inviteCodeParam === event.invite_code;
  const canRegister = !isInviteOnly || hasValidInvite;

  const addMember = () => {
    const m = memberInput.trim();
    if (m && !members.includes(m) && members.length < 4) setMembers(prev => [...prev, m]);
    setMemberInput('');
  };

  const handleRegister = async () => {
    if (!user) { router.push('/login'); return; }
    try {
      const res: any = await registerMutation.mutateAsync(
        isInviteOnly ? { invite_code: inviteCodeParam || '' } : undefined
      );
      toast.success(res?.status === 'pending' ? 'Request sent — waiting for approval' : 'Registered!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleTeamRegister = async () => {
    if (!user) { router.push('/login'); return; }
    if (!teamName.trim()) { toast.error('Enter a team name'); return; }
    try {
      const payload: any = { team_name: teamName.trim(), team_members: members };
      if (isInviteOnly) payload.invite_code = inviteCodeParam || '';
      const res: any = await registerMutation.mutateAsync(payload);
      toast.success(res?.status === 'pending' ? 'Request sent — waiting for approval' : 'Team registered!');
      setShowTeamForm(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  const handlePublish = async () => {
    try {
      await updateEvent.mutateAsync({ status: 'published' });
      toast.success('Event published!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to publish');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    try {
      await deleteEvent.mutateAsync(eventId);
      toast.success('Event deleted');
      router.push('/events');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: event.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/events" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 w-fit">
        <ArrowLeft size={14} /> Back to events
      </Link>

      {/* Title + actions ABOVE the image */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            <span className={`text-sm font-semibold px-3 py-1 rounded-lg ${colors.bg} ${colors.text}`}>
              {typeLabel}
            </span>
            {event.status === 'draft' && (
              <span className="text-sm bg-gray-100 text-gray-500 px-3 py-1 rounded-lg">Draft</span>
            )}
            {event.status === 'published' && (
              <span className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 size={13} /> Published
              </span>
            )}
            {event.status === 'finished' && (
              <span className="text-sm bg-gray-100 text-gray-500 px-3 py-1 rounded-lg">Finished</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{event.title}</h1>
          {event.owner_name && (
            <p className="text-gray-500 text-sm mt-1">Organized by {event.owner_name}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {isOwner && event.status === 'draft' && (
            <button
              onClick={handlePublish}
              disabled={updateEvent.isPending}
              className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium"
            >
              {updateEvent.isPending ? 'Publishing...' : 'Publish'}
            </button>
          )}
          {canEdit && (
            <Link
              href={`/events/${eventId}/edit`}
              className="flex items-center gap-1.5 text-sm border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              <Pencil size={13} /> Edit
            </Link>
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 text-sm text-red-600 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Image / Carousel below title */}
      {Array.isArray(event.images) && event.images.length > 0 ? (
        <EventCarousel images={event.images} title={event.title} />
      ) : event.cover_image ? (
        <img src={event.cover_image} alt={event.title} className="w-full h-64 object-cover rounded-xl mb-6" />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl mb-6" />
      )}

      {/* Share */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Share2 size={14} /> Share
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {linkCopied ? <Check size={14} className="text-green-600" /> : <Link2 size={14} />}
            {linkCopied ? 'Copied!' : 'Copy link'}
          </button>
        </div>

        {/* Event social media links — far right */}
        {(event.social_links?.linkedin || event.social_links?.instagram || event.social_links?.x) && (
          <div className="flex items-center gap-1">
            {event.social_links?.linkedin && (
              <a href={event.social_links.linkedin} target="_blank" rel="noopener noreferrer"
                title="LinkedIn" className="p-2 text-gray-400 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            )}
            {event.social_links?.instagram && (
              <a href={event.social_links.instagram} target="_blank" rel="noopener noreferrer"
                title="Instagram" className="p-2 text-gray-400 hover:text-pink-600 transition-colors rounded-lg hover:bg-pink-50">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
            )}
            {event.social_links?.x && (
              <a href={event.social_links.x} target="_blank" rel="noopener noreferrer"
                title="X (Twitter)" className="p-2 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100">
        {event.date && (
          <span className="flex items-center gap-2">
            <Calendar size={14} className="text-blue-700 shrink-0" />
            {format(new Date(event.date), 'MMM d, yyyy · HH:mm')}
            {event.end_date && ` → ${format(new Date(event.end_date), 'MMM d, yyyy')}`}
          </span>
        )}
        {event.location && (
          <span className="flex items-center gap-2">
            {event.location === 'Online' ? <Globe size={14} className="text-blue-700" /> : <MapPin size={14} className="text-blue-700" />}
            {event.location}
          </span>
        )}
        <span className="flex items-center gap-2">
          <Users size={14} className="text-blue-700" />
          {totalAttendees} registered
        </span>
      </div>

      {event.description && (
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
        </div>
      )}

      {Array.isArray(event.agenda) && event.agenda.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Agenda</h2>
          <div className="space-y-0 border border-gray-100 rounded-xl overflow-hidden">
            {event.agenda.map((item: any, i: number) => (
              <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                {item.time && (
                  <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded shrink-0 self-start mt-0.5">
                    {item.time}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registration block */}
      {event.status === 'published' && !user && (
        <div className="mb-8">
          {isInviteOnly && !hasValidInvite ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-lg px-4 py-3 w-fit">
              <Lock size={14} /> This event is invite-only. You need a valid invite link.
            </div>
          ) : (
            <Link href="/login" className="inline-block bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition-colors font-medium text-sm">
              Login to register
            </Link>
          )}
        </div>
      )}

      {event.status === 'published' && user && !canEdit && (
        <div className="mb-8">
          {isInviteOnly && !hasValidInvite ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-lg px-4 py-3 w-fit">
              <Lock size={14} /> This event is invite-only. You need a valid invite link.
            </div>
          ) : isApproval && event.viewer_role === 'visitor' && !isHackathon ? (
            <button
              onClick={handleRegister}
              disabled={registerMutation.isPending}
              className="flex items-center gap-2 bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 disabled:opacity-50 transition-colors font-medium text-sm"
            >
              <Clock size={14} />
              {registerMutation.isPending ? 'Sending...' : 'Request to join'}
            </button>
          ) : isHackathon && !showTeamForm && canRegister ? (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleRegister}
                disabled={registerMutation.isPending}
                className="bg-blue-800 text-white px-5 py-2.5 rounded-lg hover:bg-blue-900 disabled:opacity-50 transition-colors font-medium text-sm"
              >
                {registerMutation.isPending ? 'Registering...' : isApproval ? 'Request to join (solo)' : 'Register solo'}
              </button>
              <button
                onClick={() => setShowTeamForm(true)}
                className="flex items-center gap-1.5 border border-blue-800 text-blue-800 px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
              >
                <Users size={14} /> {isApproval ? 'Request as team' : 'Register as team'}
              </button>
            </div>
          ) : null}

          {isHackathon && showTeamForm && (
            <div className="border border-gray-200 rounded-xl p-5 max-w-md bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">Team Registration</h3>
                <button onClick={() => setShowTeamForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Team name *</label>
                  <input
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. ByteForce"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Team members <span className="text-gray-400">(max 4, optional)</span></label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {members.map(m => (
                      <span key={m} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-800 border border-blue-100 px-2 py-0.5 rounded-md">
                        {m}
                        <button type="button" onClick={() => setMembers(p => p.filter(x => x !== m))} className="text-blue-400 hover:text-red-500">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                  {members.length < 4 && (
                    <div className="flex gap-2">
                      <input
                        value={memberInput}
                        onChange={e => setMemberInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMember())}
                        className={inputClass}
                        placeholder="Member name, press Enter"
                      />
                      <button type="button" onClick={addMember} className="px-3 border border-gray-300 rounded-lg hover:bg-white text-gray-600 transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleTeamRegister}
                    disabled={registerMutation.isPending}
                    className="bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-900 disabled:opacity-50 transition-colors"
                  >
                    {registerMutation.isPending ? 'Registering...' : 'Register team'}
                  </button>
                  <button onClick={() => setShowTeamForm(false)} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-white transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isHackathon && canRegister && !isApproval && (
            <button
              onClick={handleRegister}
              disabled={registerMutation.isPending}
              className="bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 disabled:opacity-50 transition-colors font-medium text-sm"
            >
              {registerMutation.isPending ? 'Registering...' : 'Register for this event'}
            </button>
          )}
        </div>
      )}

      {canEdit && (
        <div className="mb-6">
          <AttendeesPanel
            eventId={eventId}
            isOwner={isOwner}
            accessType={accessType}
            inviteCode={event.invite_code}
          />
        </div>
      )}

      {isOwner && (
        <div className="mb-8">
          <StaffManagement eventId={eventId} staff={event.staff || []} />
        </div>
      )}

      <QASection eventId={eventId} eventRole={event.viewer_role} />
    </div>
  );
}
