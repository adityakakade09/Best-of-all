'use client';

import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  onRequestLocation?: () => void;
  locationStatus?: 'idle' | 'locating' | 'granted' | 'denied' | 'unsupported';
  size?: 'hero' | 'compact';
}

const PLACEHOLDER_EXAMPLES = ['Pizza near me', 'iPhone 16', 'Milk 1L', 'Nike running shoes', 'Paracetamol'];

export function SearchBar({
  initialQuery = '',
  onSearch,
  onRequestLocation,
  locationStatus = 'idle',
  size = 'hero',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <form onSubmit={submit} className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'glass-panel flex items-center gap-2 rounded-full pl-5 pr-2 transition-shadow focus-within:shadow-glass-lg',
          size === 'hero' ? 'py-2.5' : 'py-1.5'
        )}
      >
        <Search className={cn('shrink-0 text-ink-muted dark:text-ink-muted-dark', size === 'hero' ? 'h-5 w-5' : 'h-4 w-4')} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search "${PLACEHOLDER_EXAMPLES[0]}", "${PLACEHOLDER_EXAMPLES[1]}", "${PLACEHOLDER_EXAMPLES[2]}"...`}
          aria-label="Search for anything across all platforms"
          className={cn(
            'flex-1 bg-transparent outline-none placeholder:text-ink-muted dark:placeholder:text-ink-muted-dark',
            size === 'hero' ? 'text-base' : 'text-sm'
          )}
        />
        {onRequestLocation && (
          <button
            type="button"
            onClick={onRequestLocation}
            title="Use my location"
            className={cn(
              'flex items-center justify-center rounded-full transition-colors',
              size === 'hero' ? 'h-10 w-10' : 'h-8 w-8',
              locationStatus === 'granted'
                ? 'bg-signal-teal/15 text-signal-teal'
                : 'bg-black/5 dark:bg-white/10 text-ink-muted dark:text-ink-muted-dark hover:bg-black/10 dark:hover:bg-white/15'
            )}
          >
            {locationStatus === 'locating' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
          </button>
        )}
        <button type="submit" className={cn('btn-primary shrink-0', size === 'compact' && '!px-4 !py-2 text-sm')}>
          Search
        </button>
      </motion.div>
    </form>
  );
}
