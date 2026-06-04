'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEvent, useRegisterForEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useEvents';
import { useAuthStore } from '@/store/auth.store';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Pencil, Trash2, Globe, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { EVENT_TYPES } from '@/lib/utils';
import { QASection } from '@/components/QASection';
import { StaffManagement } from '@/components/StaffManagement';

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

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading } = useEvent(eventId);
  const { user } = useAuthStore();
  const router = useRouter();
  const registerMutation = useRegisterForEvent(eventId);
  const updateEvent = useUpdateEvent(eventId);
  const deleteEvent = useDeleteEvent();

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

  const handleRegister = async () => {
    if (!user) { router.push('/login'); return; }
    try {
      await registerMutation.mutateAsync(undefined);
      toast.success('Registered successfully!');
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href="/events" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 w-fit">
        <ArrowLeft size={14} /> Back to events
      </Link>

      {/* Cover */}
      {event.cover_image ? (
        <img src={event.cover_image} alt={event.title} className="w-full h-64 object-cover rounded-xl mb-6" />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl mb-6" />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
              {typeLabel}
            </span>
            {event.status === 'draft' && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">Draft</span>
            )}
            {event.status === 'published' && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 size={10} /> Published
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{event.title}</h1>
          {event.owner_name && (
            <p className="text-gray-500 text-sm mt-1">Organized by {event.owner_name}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
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

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100">
        {event.date && (
          <span className="flex items-center gap-2">
            <Calendar size={14} className="text-blue-700 shrink-0" />
            {format(new Date(event.date), 'MMM d, yyyy · HH:mm')}
            {event.end_date && ` - ${format(new Date(event.end_date), 'MMM d, yyyy')}`}
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

      {/* Description */}
      {event.description && (
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
        </div>
      )}

      {/* Register button */}
      {event.status === 'published' && user && !canEdit && (
        <div className="mb-8">
          <button
            onClick={handleRegister}
            disabled={registerMutation.isPending}
            className="bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 disabled:opacity-50 transition-colors font-medium text-sm"
          >
            {registerMutation.isPending ? 'Registering...' : 'Register for this event'}
          </button>
        </div>
      )}

      {event.status === 'published' && !user && (
        <div className="mb-8">
          <Link
            href="/login"
            className="inline-block bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition-colors font-medium text-sm"
          >
            Login to register
          </Link>
        </div>
      )}

      {/* Staff management */}
      {isOwner && (
        <div className="mb-8">
          <StaffManagement eventId={eventId} staff={event.staff || []} />
        </div>
      )}

      {/* Q&A */}
      <QASection eventId={eventId} eventRole={event.viewer_role} />
    </div>
  );
}
