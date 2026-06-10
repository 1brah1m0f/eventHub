'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/settings.store';
import { AuthGuard } from '@/components/AuthGuard';

function ThemeSync() {
  const { darkMode } = useSettingsStore();
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } }));
  return (
    <QueryClientProvider client={qc}>
      <ThemeSync />
      <AuthGuard>{children}</AuthGuard>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
