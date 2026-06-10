'use client';
import { useAuthStore } from '@/store/auth.store';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdateProfile } from '@/hooks/useProfile';
import { X, Check, Plus, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 bg-white';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

const SOCIAL_PLATFORMS = [
  { key: 'x_url', label: 'X (Twitter)', icon: XIcon, placeholder: 'https://x.com/yourhandle', color: 'hover:text-black' },
  { key: 'linkedin_url', label: 'LinkedIn', icon: LinkedInIcon, placeholder: 'https://linkedin.com/in/yourname', color: 'hover:text-violet-700' },
  { key: 'instagram_url', label: 'Instagram', icon: InstagramIcon, placeholder: 'https://instagram.com/yourhandle', color: 'hover:text-pink-600' },
] as const;

function ProfileContent() {
  const { user, fetchMe, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    name: '', bio: '', skills: [] as string[],
    x_url: '', linkedin_url: '', instagram_url: '',
  });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const updateProfile = useUpdateProfile();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) { router.push('/login'); return; }
    fetchMe().catch(() => {});
  }, [_hasHydrated, user]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        skills: user.skills || [],
        x_url: user.x_url || '',
        linkedin_url: user.linkedin_url || '',
        instagram_url: user.instagram_url || '',
      });
    }
  }, [user]);

  if (!_hasHydrated || !user) return null;

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) setForm(f => ({ ...f, skills: [...f.skills, s] }));
    setSkillInput('');
  };

  const removeSkill = (s: string) => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }));

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/upload', fd);
      await api.patch('/auth/me', { avatar_url: data.url });
      await fetchMe();
      toast.success('Avatar updated');
    } catch {
      toast.error('Upload failed');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleSocialClick = (platform: typeof SOCIAL_PLATFORMS[number]) => {
    const current = form[platform.key] || '';
    const entered = window.prompt(`${platform.label} profile URL:`, current);
    if (entered === null) return;
    setForm(f => ({ ...f, [platform.key]: entered.trim() }));
  };

  const handleSave = async () => {
    try {
      const updated = await updateProfile.mutateAsync(form);
      useAuthStore.setState({ user: { ...user, ...updated } });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Avatar */}
        <div className="flex items-start gap-5 mb-6">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full bg-violet-900 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
              {user.avatar_url
                ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                : user.name?.[0]?.toUpperCase()
              }
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-violet-700 hover:bg-violet-600 rounded-full flex items-center justify-center text-white border-2 border-white transition-colors disabled:opacity-50"
            >
              <Camera size={11} />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Edit form — always open */}
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Bio</label>
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} className={inputClass} placeholder="Tell others about yourself..." />
          </div>
          <div>
            <label className={labelClass}>Skills</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.skills.map(s => (
                <span key={s} className="flex items-center gap-1 text-xs bg-violet-50 text-violet-800 border border-violet-100 px-2 py-0.5 rounded-md">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="text-violet-400 hover:text-red-500 transition-colors">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className={inputClass}
                placeholder="Add skill, press Enter"
              />
              <button type="button" onClick={addSkill} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Social media */}
          <div>
            <label className={labelClass}>Link your social media profiles</label>
            <div className="flex gap-3 mt-1">
              {SOCIAL_PLATFORMS.map(p => {
                const hasUrl = !!form[p.key];
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handleSocialClick(p)}
                    title={hasUrl ? `${p.label}: ${form[p.key]}` : `Add ${p.label}`}
                    className={`p-2.5 rounded-xl border-2 transition-all ${
                      hasUrl
                        ? 'border-violet-600 text-violet-700 bg-violet-50'
                        : 'border-gray-200 text-gray-400 hover:border-gray-300 bg-white'
                    } ${p.color}`}
                  >
                    <p.icon />
                  </button>
                );
              })}
            </div>
            {SOCIAL_PLATFORMS.some(p => form[p.key]) && (
              <div className="mt-2 space-y-1">
                {SOCIAL_PLATFORMS.filter(p => form[p.key]).map(p => (
                  <p key={p.key} className="text-xs text-gray-400 truncate">
                    <span className="font-medium text-gray-600">{p.label}:</span> {form[p.key]}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="flex items-center gap-1.5 bg-violet-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-violet-900 disabled:opacity-50 transition-colors"
            >
              <Check size={14} />
              {updateProfile.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-8 animate-pulse"><div className="h-96 bg-gray-100 rounded-xl" /></div>}>
      <ProfileContent />
    </Suspense>
  );
}
