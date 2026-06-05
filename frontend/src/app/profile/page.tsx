'use client';
import { useAuthStore } from '@/store/auth.store';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdateProfile } from '@/hooks/useProfile';
import { ExternalLink, Pencil, X, Check, Plus, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 bg-white';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

function ProfileContent() {
  const { user, fetchMe, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({ name: '', bio: '', linkedin_url: '', skills: [] as string[] });
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
        linkedin_url: user.linkedin_url || '',
        skills: user.skills || [],
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

  const handleSave = async () => {
    try {
      const updated = await updateProfile.mutateAsync(form);
      useAuthStore.setState({ user: { ...user, ...updated } });
      toast.success('Profile updated');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
              {user.avatar_url
                ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                : user.name?.[0]?.toUpperCase()
              }
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-700 hover:bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white transition-colors disabled:opacity-50"
              title="Change avatar"
            >
              <Camera size={11} />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
            {user.linkedin_url && (
              <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-700 text-xs mt-1 hover:underline">
                <ExternalLink size={11} /> LinkedIn
              </a>
            )}
            {user.bio && <p className="text-gray-600 text-sm mt-2 leading-relaxed">{user.bio}</p>}
            {user.skills?.length ? (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {user.skills.map((s: string) => (
                  <span key={s} className="text-xs bg-blue-50 text-blue-800 border border-blue-100 px-2 py-0.5 rounded-md font-medium">
                    {s}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
            >
              <Pencil size={13} /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Edit Profile</h2>
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
              <label className={labelClass}>LinkedIn URL</label>
              <input value={form.linkedin_url} onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))} className={inputClass} placeholder="https://linkedin.com/in/yourname" />
            </div>
            <div>
              <label className={labelClass}>Skills</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.skills.map(s => (
                  <span key={s} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-800 border border-blue-100 px-2 py-0.5 rounded-md">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="text-blue-400 hover:text-red-500 transition-colors">
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
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="flex items-center gap-1.5 bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-900 disabled:opacity-50 transition-colors"
              >
                <Check size={14} />
                {updateProfile.isPending ? 'Saving...' : 'Save changes'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-8 animate-pulse"><div className="h-40 bg-gray-100 rounded-xl" /></div>}>
      <ProfileContent />
    </Suspense>
  );
}
