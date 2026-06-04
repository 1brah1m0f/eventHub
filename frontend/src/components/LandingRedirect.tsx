'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export function LandingRedirect() {
  const { user } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (user) router.replace('/events');
  }, [user]);
  return null;
}
