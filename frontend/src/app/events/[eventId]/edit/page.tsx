'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEvent, useUpdateEvent } from '@/hooks/useEvents';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DynamicEventFields } from '@/components/DynamicEventFields';
import { AgendaEditor, AgendaItem } from '@/components/AgendaEditor';
import { Coords, LocationPicker } from '@/components/LocationPicker';

export default function EditEventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading } = useEvent(eventId);
  const update = useUpdateEvent(eventId);
  const router = useRouter();

  const { register, handleSubmit, setValue, watch, reset } = useForm<any>();
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [coords, setCoords] = useState<Coords | null>(null);

  useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description,
        type: event.type,
        date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
        end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
        location: event.location,
        price: event.price ?? '',
        is_online: Boolean(event.is_online),
        status: event.status,
        extra_fields: event.extra_fields || {},
      });
      setAgenda(Array.isArray(event.agenda) ? event.agenda : []);
      setCoords(event.lat != null && event.lng != null ? { lat: Number(event.lat), lng: Number(event.lng) } : null);
    }
  }, [event]);

  const selectedType = watch('type');
  const isOnline = watch('is_online');

  const onSubmit = async (data: any) => {
    try {
      const filteredAgenda = agenda.filter(a => a.title.trim());
      await update.mutateAsync({ ...data, agenda: filteredAgenda, lat: data.is_online ? null : coords?.lat, lng: data.is_online ? null : coords?.lng });
      toast.success('Event updated!');
      router.push(`/events/${eventId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  if (isLoading) return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-96 bg-gray-100 rounded-2xl" />
    </div>
  );
  if (!event) return <div className="text-center py-20">Event not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
        <p className="text-gray-500 text-sm mt-1">Update your event details</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white rounded-2xl border p-6 shadow-sm">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input {...register('title')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea {...register('description')} rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input {...register('date')} type="datetime-local"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input {...register('end_date')} type="datetime-local"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <div className="mb-3 flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                {...register('is_online')}
                onChange={e => {
                  setValue('is_online', e.target.checked);
                  if (e.target.checked) setCoords(null);
                }}
                className="h-4 w-4 rounded border-gray-300 text-violet-800 focus:ring-violet-700"
              />
              This is an online event
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              Price
              <input {...register('price')} type="number" min="0" step="0.01"
                className="w-28 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700" />
            </label>
          </div>
          <input {...register('location')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700" />
          {!isOnline && (
            <LocationPicker
              value={coords}
              onChange={setCoords}
              locationLabel={watch('location')}
              onLocationLabelChange={(label) => setValue('location', label, { shouldDirty: true })}
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select {...register('status')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="finished">Finished</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label>
          <AgendaEditor value={agenda} onChange={setAgenda} />
        </div>

        {selectedType && (
          <DynamicEventFields type={selectedType} initialValues={event.extra_fields || {}}
            onChange={(f) => setValue('extra_fields', f)} />
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={update.isPending}
            className="flex-1 bg-violet-800 text-white py-2.5 rounded-lg font-medium hover:bg-violet-900 disabled:opacity-50 transition-colors">
            {update.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
