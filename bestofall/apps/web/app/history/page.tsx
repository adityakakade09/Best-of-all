'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { SearchHistoryEntry } from '@bestofall/shared';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { api } from '@/lib/apiClient';
import { CATEGORY_LABELS } from '@/lib/format';
import { Clock, Search, Trash2 } from 'lucide-react';

function HistoryContent() {
  const router = useRouter();
  const [entries, setEntries] = useState<SearchHistoryEntry[] | null>(null);

  useEffect(() => {
    api
      .get<SearchHistoryEntry[]>('/history')
      .then(setEntries)
      .catch(() => toast.error('Could not load search history'));
  }, []);

  const clearAll = async () => {
    setEntries([]);
    try {
      await api.delete('/history');
      toast.success('Search history cleared');
    } catch {
      toast.error('Failed to clear history');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-signal-indigo/10 text-signal-indigo">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold">Search history</h1>
            <p className="text-sm text-ink-muted dark:text-ink-muted-dark">Your last 50 searches.</p>
          </div>
        </div>
        {entries && entries.length > 0 && (
          <button onClick={clearAll} className="btn-ghost !px-3.5 !py-2 text-xs">
            <Trash2 className="h-3.5 w-3.5" /> Clear all
          </button>
        )}
      </div>

      {entries === null ? (
        <div className="glass-panel skeleton h-64 rounded-xl3" />
      ) : entries.length === 0 ? (
        <div className="glass-panel rounded-xl3 px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold">No searches yet</p>
        </div>
      ) : (
        <div className="glass-panel divide-y divide-black/5 dark:divide-white/10 overflow-hidden rounded-xl3">
          {entries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => router.push(`/search?q=${encodeURIComponent(entry.query)}`)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="flex items-center gap-3">
                <Search className="h-4 w-4 text-ink-muted dark:text-ink-muted-dark" />
                <span>
                  <span className="font-medium">{entry.query}</span>
                  {entry.category && (
                    <span className="ml-2 text-xs text-ink-muted dark:text-ink-muted-dark">
                      {CATEGORY_LABELS[entry.category]}
                    </span>
                  )}
                </span>
              </span>
              <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                {entry.resultCount} results
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <AuthGuard>
      <HistoryContent />
    </AuthGuard>
  );
}
