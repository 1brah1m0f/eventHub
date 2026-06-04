'use client';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateEvent } from '@/hooks/useEvents';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { EVENT_TYPES, EVENT_TYPE_FIELDS } from '@/lib/utils';
import { DynamicEventFields } from '@/components/DynamicEventFields';
import api from '@/lib/api';
import { Upload, X, ImageIcon } from 'lucide-react';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  type: z.string().min(1, 'Select event type'),
  access_type: z.enum(['public', 'invite_only', 'approval']),
  date: z.string().optional().refine(v => !v || new Date(v) > new Date(), { message: 'Date must be in the future' }),
  end_date: z.string().optional(),
  location: z.string().optional(),
  extra_fields: z.record(z.string(), z.any()).optional(),
});

type Form = z.infer<typeof schema>;

const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent bg-white';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

export default function CreateEventPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateEvent();
  const [coverImage, setCoverImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { extra_fields: {}, access_type: 'public' },
  });

  const selectedType = watch('type');

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCoverImage(data.url);
      toast.success('Cover image uploaded');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: Form) => {
    try {
      const event = await mutateAsync({ ...data, cover_image: coverImage || undefined });
      toast.success('Event created!');
      router.push(`/events/${event.event_id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create event');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Event</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details below. You can publish later.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">

        {/* Cover image */}
        <div>
          <label className={labelClass}>Cover Image</label>
          {coverImage ? (
            <div className="relative rounded-lg overflow-hidden">
              <img src={coverImage} alt="Cover" className="w-full h-48 object-cover" />
              <button
                type="button"
                onClick={() => { setCoverImage(''); if (fileRef.current) fileRef.current.value = ''; }}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <span className="text-sm">Uploading...</span>
              ) : (
                <>
                  <ImageIcon size={24} />
                  <span className="text-sm">Click to upload cover image</span>
                  <span className="text-xs">PNG, JPG up to 5MB</span>
                </>
              )}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </div>

        <div>
          <label className={labelClass}>Event Type *</label>
          <select {...register('type')} className={inputClass}>
            <option value="">Select type...</option>
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Who can join?</label>
          <select {...register('access_type')} className={inputClass}>
            <option value="public">Public — anyone can register</option>
            <option value="approval">Approval required — you approve each request</option>
            <option value="invite_only">Invite only — only people with the link</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            {watch('access_type') === 'invite_only' && 'A unique invite link will be generated after creation.'}
            {watch('access_type') === 'approval' && 'Registrants send a request — you approve or reject from the event page.'}
          </p>
        </div>

        <div>
          <label className={labelClass}>Title *</label>
          <input {...register('title')} className={inputClass} placeholder="e.g. TechHack Baku 2026" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea {...register('description')} rows={4} className={inputClass} placeholder="What is this event about?" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Start Date & Time</label>
            <input {...register('date')} type="datetime-local" className={inputClass}
            min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)} />
          </div>
          <div>
            <label className={labelClass}>End Date & Time</label>
            <input {...register('end_date')} type="datetime-local" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Location</label>
          <input {...register('location')} className={inputClass} placeholder="City, Country or Online" />
        </div>

        {selectedType && EVENT_TYPE_FIELDS[selectedType] && (
          <DynamicEventFields type={selectedType} onChange={(fields) => setValue('extra_fields', fields)} />
        )}

        <button
          type="submit"
          disabled={isPending || uploading}
          className="w-full bg-blue-800 text-white py-3 rounded-lg font-medium hover:bg-blue-900 disabled:opacity-50 transition-colors text-sm"
        >
          {isPending ? 'Creating...' : 'Create Event (Draft)'}
        </button>
      </form>
    </div>
  );
}
