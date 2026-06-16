'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

// Pages a guest (not logged in) is allowed to see.
const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password'];

function isPublic(path: string) {
  return PUBLIC_ROUTES.includes(path);
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, _hasHydrated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;          // wait for persisted auth to load
    if (!user && !isPublic(pathname)) {
      router.replace('/');               // guest on protected page -> landing
    }
  }, [user, _hasHydrated, pathname, router]);

  // Block flash of protected content before redirect.
  if (_hasHydrated && !user && !isPublic(pathname)) return null;

  return <>{children}</>;
}
