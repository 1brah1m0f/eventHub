'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEvent, useUpdateEvent } from '@/hooks/useEvents';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { DynamicEventFields } from '@/components/DynamicEventFields';
import { EVENT_TYPES } from '@/lib/utils';

export default function EditEventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading } = useEvent(eventId);
  const update = useUpdateEvent(eventId);
  const router = useRouter();

  const { register, handleSubmit, setValue, watch, reset } = useForm<any>();

  useEffect(() => {
    if (event) reset({
      title: event.title,
      description: event.description,
      type: event.type,
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
      location: event.location,
      status: event.status,
      extra_fields: event.extra_fields || {},
    });
  }, [event]);

  const selectedType = watch('type');

  const onSubmit = async (data: any) => {
    try {
      await update.mutateAsync(data);
      toast.success('Event updated!');
      router.push(`/events/${eventId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse"><div className="h-96 bg-gray-100 rounded-xl" /></div>;
  if (!event) return <div className="text-center py-20">Event not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white rounded-xl border p-6">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input {...register('title')} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea {...register('description')} rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input {...register('date')} type="datetime-local"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input {...register('end_date')} type="datetime-local"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input {...register('location')} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select {...register('status')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="finished">Finished</option>
          </select>
        </div>

        {selectedType && (
          <DynamicEventFields type={selectedType} initialValues={event.extra_fields || {}}
            onChange={(f) => setValue('extra_fields', f)} />
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={update.isPending}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
            {update.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
