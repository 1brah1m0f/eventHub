'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEvent, useRegisterForEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useEvents';
import { useAuthStore } from '@/store/auth.store';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Settings, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { EVENT_TYPES } from '@/lib/utils';
import { QASection } from '@/components/QASection';
import { StaffManagement } from '@/components/StaffManagement';

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading } = useEvent(eventId);
  const { user } = useAuthStore();
  const router = useRouter();
  const register = useRegisterForEvent(eventId);
  const updateEvent = useUpdateEvent(eventId);
  const deleteEvent = useDeleteEvent();

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse"><div className="h-64 bg-gray-100 rounded-xl" /></div>;
  if (!event) return <div className="text-center py-20 text-gray-500">Event not found</div>;

  const isOwner = event.viewer_role === 'owner';
  const isStaff = event.viewer_role === 'staff';
  const canEdit = isOwner || isStaff;
  const typeLabel = EVENT_TYPES.find(t => t.value === event.type)?.label || event.type;

  const handleRegister = async () => {
    try {
      await register.mutateAsync(undefined);
      toast.success('Registered!');
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
      {event.cover_image ? (
        <img src={event.cover_image} alt={event.title} className="w-full h-64 object-cover rounded-xl mb-6" />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mb-6" />
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{typeLabel}</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{event.title}</h1>
          <p className="text-gray-500 mt-1">by {event.owner_name}</p>
        </div>
        <div className="flex gap-2">
          {isOwner && event.status === 'draft' && (
            <button onClick={handlePublish} className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700">
              Publish
            </button>
          )}
          {canEdit && (
            <a href={`/events/${eventId}/edit`} className="flex items-center gap-1 text-sm border px-3 py-1.5 rounded-md hover:bg-gray-50">
              <Settings size={14} /> Edit
            </a>
          )}
          {isOwner && (
            <button onClick={handleDelete} className="flex items-center gap-1 text-sm text-red-600 border border-red-200 px-3 py-1.5 rounded-md hover:bg-red-50">
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
        {event.date && (
          <span className="flex items-center gap-1"><Calendar size={14} /> {format(new Date(event.date), 'MMM d, yyyy HH:mm')}</span>
        )}
        {event.location && (
          <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
        )}
        <span className="flex items-center gap-1">
          <Users size={14} />
          {event.registration_counts?.reduce((sum: number, r: any) => sum + parseInt(r.count), 0) || 0} registered
        </span>
      </div>

      {event.description && (
        <div className="prose max-w-none mb-8">
          <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
        </div>
      )}

      {user && !canEdit && event.status === 'published' && (
        <button onClick={handleRegister} disabled={register.isPending}
          className="mb-8 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {register.isPending ? 'Registering...' : 'Register for Event'}
        </button>
      )}

      {isOwner && <StaffManagement eventId={eventId} staff={event.staff || []} />}

      <QASection eventId={eventId} eventRole={event.viewer_role} />
    </div>
  );
}
