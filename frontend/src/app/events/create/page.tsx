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
import { AgendaEditor, AgendaItem } from '@/components/AgendaEditor';

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const LIIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const IGIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

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
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [socialLinks, setSocialLinks] = useState({ linkedin: '', instagram: '', x: '' });
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
      const filteredAgenda = agenda.filter(a => a.title.trim());
      const sl = { linkedin: socialLinks.linkedin.trim(), instagram: socialLinks.instagram.trim(), x: socialLinks.x.trim() };
      const hasSocial = sl.linkedin || sl.instagram || sl.x;
      const event = await mutateAsync({ ...data, cover_image: coverImage || undefined, agenda: filteredAgenda.length ? filteredAgenda : undefined, social_links: hasSocial ? sl : undefined });
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

        <div>
          <label className={labelClass}>Agenda</label>
          <AgendaEditor value={agenda} onChange={setAgenda} />
        </div>

        <div>
          <label className={labelClass}>Social Media Links <span className="text-gray-400 font-normal">(optional)</span></label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-7 flex justify-center text-gray-400"><LIIcon /></span>
              <input
                value={socialLinks.linkedin}
                onChange={e => setSocialLinks(s => ({ ...s, linkedin: e.target.value }))}
                className={inputClass}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 flex justify-center text-pink-400"><IGIcon /></span>
              <input
                value={socialLinks.instagram}
                onChange={e => setSocialLinks(s => ({ ...s, instagram: e.target.value }))}
                className={inputClass}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 flex justify-center text-gray-700"><XIcon /></span>
              <input
                value={socialLinks.x}
                onChange={e => setSocialLinks(s => ({ ...s, x: e.target.value }))}
                className={inputClass}
                placeholder="https://x.com/..."
              />
            </div>
          </div>
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
