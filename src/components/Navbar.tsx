'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { LogOut, Plus, User } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-indigo-600">EventHub</Link>

        <div className="flex items-center gap-4">
          <Link href="/events" className="text-sm text-gray-600 hover:text-gray-900">Browse Events</Link>

          {user ? (
            <>
              <Link href="/events/create"
                className="flex items-center gap-1 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700">
                <Plus size={14} /> New Event
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                <User size={20} />
              </Link>
              <button onClick={logout} className="text-gray-500 hover:text-red-500">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Login</Link>
              <Link href="/register"
                className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
