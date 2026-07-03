'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const router = useRouter();
  const { user, tokens } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  // zustand persist hydrates asynchronously on the client — wait one tick
  // before deciding to redirect, so a logged-in user isn't bounced on refresh.
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!tokens) {
      router.replace('/login');
    } else if (adminOnly && user?.role !== 'admin') {
      router.replace('/');
    }
  }, [hydrated, tokens, user, adminOnly, router]);

  if (!hydrated || !tokens || (adminOnly && user?.role !== 'admin')) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-signal-indigo" />
      </div>
    );
  }

  return <>{children}</>;
}
