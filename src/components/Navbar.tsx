'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { LogOut, Plus, User } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-blue-950 border-b border-blue-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-white tracking-tight">
          Event<span className="text-blue-300">Hub</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/events" className="text-sm text-blue-200 hover:text-white transition-colors">Browse Events</Link>

          {user ? (
            <>
              <Link href="/events/create"
                className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-500 transition-colors">
                <Plus size={14} /> New Event
              </Link>
              <Link href="/profile" className="text-blue-200 hover:text-white transition-colors">
                <User size={20} />
              </Link>
              <button onClick={logout} className="text-blue-300 hover:text-red-400 transition-colors">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-blue-200 hover:text-white transition-colors">Login</Link>
              <Link href="/register"
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-500 transition-colors">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
