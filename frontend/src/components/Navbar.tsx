'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, User, Calendar } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-blue-950 border-b border-blue-900/60 sticky top-0 z-50 h-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-full">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
          <Calendar size={18} className="text-blue-400" />
          Event<span className="text-blue-400">Hub</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/events"
            className="text-sm text-blue-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-blue-800/50 transition-colors"
          >
            Events
          </Link>

          {user ? (
            <>
              <Link
                href="/events/create"
                className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md transition-colors ml-1"
              >
                <Plus size={14} />
                New Event
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-1.5 text-sm text-blue-300 hover:text-white px-2 py-1.5 rounded-md hover:bg-blue-800/50 transition-colors ml-1"
                title={user.name}
              >
                <User size={16} />
                <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-blue-400 hover:text-red-400 p-1.5 rounded-md hover:bg-blue-800/50 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-blue-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-blue-800/50 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md transition-colors ml-1"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
