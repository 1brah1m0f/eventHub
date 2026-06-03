'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateEvent } from '@/hooks/useEvents';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { EVENT_TYPES, EVENT_TYPE_FIELDS } from '@/lib/utils';
import { DynamicEventFields } from '@/components/DynamicEventFields';

const schema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  type: z.string().min(1, 'Select event type'),
  date: z.string().optional(),
  end_date: z.string().optional(),
  location: z.string().optional(),
  extra_fields: z.record(z.string(), z.any()).optional(),
});

type Form = z.infer<typeof schema>;

export default function CreateEventPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateEvent();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { extra_fields: {} },
  });

  const selectedType = watch('type');

  const onSubmit = async (data: Form) => {
    try {
      const event = await mutateAsync(data);
      toast.success('Event created!');
      router.push(`/events/${event.event_id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create event');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white rounded-xl border p-6">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
          <select {...register('type')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select type...</option>
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input {...register('title')} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
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

        {selectedType && <DynamicEventFields type={selectedType} onChange={(fields) => setValue('extra_fields', fields)} />}

        <button type="submit" disabled={isPending}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
          {isPending ? 'Creating...' : 'Create Event (Draft)'}
        </button>
      </form>
    </div>
  );
}
