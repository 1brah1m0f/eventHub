'use client';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-8">
        <div className="flex items-center gap-5 mb-5">
          {user.avatar_url ? (
            <img src={user.avatar_url} className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-100" alt={user.name} />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-900 flex items-center justify-center text-3xl font-bold text-white">
              {user.name[0]}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
            {user.linkedin_url && (
              <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-700 text-xs mt-1.5 hover:underline">
                <ExternalLink size={12} /> LinkedIn
              </a>
            )}
          </div>
        </div>
        {user.bio && <p className="text-gray-700 text-sm mb-4 border-t pt-4">{user.bio}</p>}
        {user.skills?.length ? (
          <div className="flex flex-wrap gap-2 mt-1">
            {user.skills.map((s, i) => (
              <span key={i} className="text-xs bg-blue-50 text-blue-800 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
                {s}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
