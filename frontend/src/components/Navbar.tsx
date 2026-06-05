'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Plus, User, Calendar, Menu, X, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push('/');
  };

  const close = () => setOpen(false);

  return (
    <>
      <nav className="bg-blue-950 border-b border-blue-900/60 sticky top-0 z-50 h-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-full">
          <Link href={user ? '/events' : '/'} className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
            <Calendar size={18} className="text-blue-400" />
            Event<span className="text-blue-400">Hub</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            <Link
              href="/events"
              className="text-sm text-blue-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-blue-800/50 transition-colors"
            >
              Events
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-sm text-blue-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-blue-800/50 transition-colors"
                >
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>
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
                >
                  <User size={16} />
                  <span className="max-w-[120px] truncate">{user.name}</span>
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
                <Link href="/login" className="text-sm text-blue-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-blue-800/50 transition-colors">
                  Login
                </Link>
                <Link href="/register" className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md transition-colors ml-1">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden text-blue-300 hover:text-white p-1.5 rounded-md hover:bg-blue-800/50 transition-colors"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="sm:hidden fixed inset-0 z-40 bg-black/30" onClick={close}>
          <div
            className="absolute top-14 left-0 right-0 bg-blue-950 border-b border-blue-900/60 px-4 py-3 space-y-1"
            onClick={e => e.stopPropagation()}
          >
            <Link href="/events" onClick={close} className="block text-sm text-blue-300 hover:text-white px-3 py-2.5 rounded-md hover:bg-blue-800/50 transition-colors">
              Events
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" onClick={close} className="flex items-center gap-2 text-sm text-blue-300 hover:text-white px-3 py-2.5 rounded-md hover:bg-blue-800/50 transition-colors">
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
                <Link href="/events/create" onClick={close} className="flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-500 px-3 py-2.5 rounded-md transition-colors">
                  <Plus size={14} /> New Event
                </Link>
                <Link href="/profile" onClick={close} className="flex items-center gap-2 text-sm text-blue-300 hover:text-white px-3 py-2.5 rounded-md hover:bg-blue-800/50 transition-colors">
                  <User size={15} /> {user.name}
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 w-full text-sm text-red-400 hover:text-red-300 px-3 py-2.5 rounded-md hover:bg-blue-800/50 transition-colors">
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={close} className="block text-sm text-blue-300 hover:text-white px-3 py-2.5 rounded-md hover:bg-blue-800/50 transition-colors">
                  Login
                </Link>
                <Link href="/register" onClick={close} className="block text-sm text-white bg-blue-600 hover:bg-blue-500 px-3 py-2.5 rounded-md transition-colors">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
