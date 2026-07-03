'use client';

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/lib/theme';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          className: 'glass-panel !text-ink dark:!text-ink-inverse !rounded-2xl',
          duration: 3000,
        }}
      />
    </ThemeProvider>
  );
}
