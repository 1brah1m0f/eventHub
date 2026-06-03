'use client';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import { ExternalLink } from 'lucide-react';

export default function ProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
    else fetchMe();
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl border p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          {user.avatar_url ? (
            <img src={user.avatar_url} className="w-16 h-16 rounded-full object-cover" alt={user.name} />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-700">
              {user.name[0]}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
            {user.linkedin_url && (
              <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 text-xs mt-1 hover:underline">
                <ExternalLink size={12} /> LinkedIn
              </a>
            )}
          </div>
        </div>
        {user.bio && <p className="text-gray-700 text-sm">{user.bio}</p>}
        {user.skills?.length ? (
          <div className="flex flex-wrap gap-2 mt-3">
            {user.skills.map((s, i) => (
              <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
