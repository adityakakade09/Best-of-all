'use client';

import { useTheme } from '@/lib/theme';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/cn';

const OPTIONS = [
  { value: 'light' as const, icon: Sun, label: 'Light mode' },
  { value: 'system' as const, icon: Monitor, label: 'System theme' },
  { value: 'dark' as const, icon: Moon, label: 'Dark mode' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="glass-panel flex items-center gap-0.5 rounded-full p-1" role="group" aria-label="Theme">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={label}
          aria-pressed={theme === value}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
            theme === value
              ? 'bg-signal-indigo text-white'
              : 'text-ink-muted dark:text-ink-muted-dark hover:bg-black/5 dark:hover:bg-white/10'
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
