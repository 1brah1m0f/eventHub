'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useSettingsStore } from '@/store/settings.store';
import { useT } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import {
  LogOut, Plus, Calendar, Menu, X,
  BarChart2, Star, Users,
  ClipboardList, Pencil, Sun, Moon, Globe,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return { open, setOpen, ref };
}

const linkCls = 'flex items-center gap-2.5 text-sm text-gray-700 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors';
const navLinkCls = 'text-sm text-blue-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-blue-800/50 transition-colors';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode, language, setLanguage } = useSettingsStore();
  const t = useT();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const orgDropdown = useDropdown();
  const profileDropdown = useDropdown();

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    orgDropdown.setOpen(false);
    profileDropdown.setOpen(false);
    router.push('/');
  };

  const close = () => {
    setMobileOpen(false);
    orgDropdown.setOpen(false);
    profileDropdown.setOpen(false);
  };

  return (
    <>
      <nav className="bg-blue-950 border-b border-blue-900/60 sticky top-0 z-50 h-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-full">

          {/* Logo */}
          <Link href={user ? '/events' : '/'} className="flex items-center gap-2 text-white font-bold text-lg tracking-tight shrink-0">
            <Calendar size={18} className="text-blue-400" />
            Event<span className="text-blue-400">Hub</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            <Link href="/events" className={navLinkCls}>{t('home')}</Link>

            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="flex items-center justify-center w-8 h-8 rounded-md text-blue-300 hover:text-white hover:bg-blue-800/50 transition-colors"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {user && (
              <>
                {/* Organizations dropdown */}
                <div
                  className="relative"
                  ref={orgDropdown.ref}
                  onMouseEnter={() => orgDropdown.setOpen(true)}
                  onMouseLeave={() => orgDropdown.setOpen(false)}
                >
                  <button className={`${navLinkCls} flex items-center gap-1`}>
                    {t('organizations')}
                  </button>

                  <div className={`absolute top-full left-0 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 transition-all duration-200 origin-top ${
                    orgDropdown.open ? 'opacity-100 scale-y-100 translate-y-1.5 pointer-events-auto' : 'opacity-0 scale-y-95 translate-y-0 pointer-events-none'
                  }`}>
                    <Link href="/dashboard" onClick={close} className={linkCls}>
                      <BarChart2 size={15} className="text-blue-700" /> {t('statistics')}
                    </Link>
                    <Link href="/events/create" onClick={close} className={linkCls}>
                      <Plus size={15} className="text-emerald-600" /> {t('newEvent')}
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <Link href="/my-events" onClick={close} className={linkCls}>
                      <Star size={15} className="text-orange-500" /> {t('myEvents')}
                    </Link>
                    <Link href="/staff-events" onClick={close} className={linkCls}>
                      <Users size={15} className="text-violet-600" /> {t('staffEvents')}
                    </Link>
                  </div>
                </div>

                {/* Profile dropdown */}
                <div className="relative ml-1" ref={profileDropdown.ref}>
                  <button
                    onClick={() => { profileDropdown.setOpen(o => !o); orgDropdown.setOpen(false); }}
                    className="flex items-center gap-1.5 text-sm text-blue-300 hover:text-white px-2 py-1.5 rounded-md hover:bg-blue-800/50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
                      {user.avatar_url
                        ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                        : user.name?.[0]?.toUpperCase()
                      }
                    </div>
                  </button>

                  {profileDropdown.open && (
                    <div className="absolute top-full mt-1.5 right-0 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                      <Link href="/registered-events" onClick={close} className={linkCls}>
                        <ClipboardList size={15} className="text-blue-700" /> {t('registeredEvents')}
                      </Link>
                      <Link href="/profile" onClick={close} className={linkCls}>
                        <Pencil size={15} className="text-gray-500" /> {t('editProfile')}
                      </Link>

                      {/* Settings */}
                      <div className="border-t border-gray-100 my-1" />
                      <div className="px-3 py-2">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2.5">{t('settings')}</p>

                        {/* Language */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm text-gray-700">
                            <Globe size={13} className="text-gray-500" />
                            {t('language')}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setLanguage('en')}
                              className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${language === 'en' ? 'bg-blue-800 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                            >EN</button>
                            <button
                              onClick={() => setLanguage('az')}
                              className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${language === 'az' ? 'bg-blue-800 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                            >AZ</button>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 my-1" />
                      <button onClick={handleLogout} className={`${linkCls} w-full text-red-500 hover:text-red-600 hover:bg-red-50`}>
                        <LogOut size={15} /> {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {!user && (
              <>
                <Link href="/login" className={navLinkCls}>{t('login')}</Link>
                <Link href="/register" className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md transition-colors ml-1">
                  {t('signUp')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden text-blue-300 hover:text-white p-1.5 rounded-md hover:bg-blue-800/50 transition-colors"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-40 bg-black/30" onClick={close}>
          <div
            className="absolute top-14 left-0 right-0 bg-blue-950 border-b border-blue-900/60 px-4 py-3 space-y-1"
            onClick={e => e.stopPropagation()}
          >
            <Link href="/events" onClick={close} className="block text-sm text-blue-300 hover:text-white px-3 py-2.5 rounded-md hover:bg-blue-800/50 transition-colors">
              {t('home')}
            </Link>

            {user ? (
              <>
                <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider px-3 pt-2 pb-1">{t('organizations')}</div>
                <Link href="/dashboard" onClick={close} className="flex items-center gap-2 text-sm text-blue-300 hover:text-white px-3 py-2.5 rounded-md hover:bg-blue-800/50 transition-colors">
                  <BarChart2 size={14} /> {t('statistics')}
                </Link>
                <Link href="/events/create" onClick={close} className="flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-500 px-3 py-2.5 rounded-md transition-colors">
                  <Plus size={14} /> {t('newEvent')}
                </Link>
                <Link href="/my-events" onClick={close} className="flex items-center gap-2 text-sm text-blue-300 hover:text-white px-3 py-2.5 rounded-md hover:bg-blue-800/50 transition-colors">
                  <Star size={14} /> {t('myEvents')}
                </Link>
                <Link href="/staff-events" onClick={close} className="flex items-center gap-2 text-sm text-blue-300 hover:text-white px-3 py-2.5 rounded-md hover:bg-blue-800/50 transition-colors">
                  <Users size={14} /> {t('staffEvents')}
                </Link>

                <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider px-3 pt-3 pb-1">{user.name}</div>
                <Link href="/registered-events" onClick={close} className="flex items-center gap-2 text-sm text-blue-300 hover:text-white px-3 py-2.5 rounded-md hover:bg-blue-800/50 transition-colors">
                  <ClipboardList size={14} /> {t('registeredEvents')}
                </Link>
                <Link href="/profile" onClick={close} className="flex items-center gap-2 text-sm text-blue-300 hover:text-white px-3 py-2.5 rounded-md hover:bg-blue-800/50 transition-colors">
                  <Pencil size={14} /> {t('editProfile')}
                </Link>

                {/* Mobile settings */}
                <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider px-3 pt-3 pb-1">{t('settings')}</div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="flex items-center gap-2 text-sm text-blue-300">
                    {darkMode ? <Moon size={14} className="text-blue-400" /> : <Sun size={14} className="text-yellow-400" />}
                    {t('darkMode')}
                  </span>
                  <button
                    onClick={toggleDarkMode}
                    className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${darkMode ? 'bg-blue-600' : 'bg-blue-900'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="flex items-center gap-2 text-sm text-blue-300">
                    <Globe size={14} /> {t('language')}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => setLanguage('en')} className={`text-xs px-2 py-0.5 rounded font-medium ${language === 'en' ? 'bg-blue-600 text-white' : 'text-blue-400 hover:bg-blue-800'}`}>EN</button>
                    <button onClick={() => setLanguage('az')} className={`text-xs px-2 py-0.5 rounded font-medium ${language === 'az' ? 'bg-blue-600 text-white' : 'text-blue-400 hover:bg-blue-800'}`}>AZ</button>
                  </div>
                </div>

                <button onClick={handleLogout} className="flex items-center gap-2 w-full text-sm text-red-400 hover:text-red-300 px-3 py-2.5 rounded-md hover:bg-blue-800/50 transition-colors">
                  <LogOut size={14} /> {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={close} className="block text-sm text-blue-300 hover:text-white px-3 py-2.5 rounded-md hover:bg-blue-800/50 transition-colors">
                  {t('login')}
                </Link>
                <Link href="/register" onClick={close} className="block text-sm text-white bg-blue-600 hover:bg-blue-500 px-3 py-2.5 rounded-md transition-colors">
                  {t('signUp')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
