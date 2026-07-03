import { ResultBadge } from '@bestofall/shared';
import { BADGE_LABELS } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Zap, Star, Tag, Truck, MapPin, Crown, Percent } from 'lucide-react';

const ICONS: Record<ResultBadge, React.ComponentType<{ className?: string }>> = {
  best_overall: Crown,
  lowest_price: Tag,
  fastest_delivery: Zap,
  top_rated: Star,
  biggest_discount: Percent,
  free_delivery: Truck,
  nearest: MapPin,
};

const STYLES: Record<ResultBadge, string> = {
  best_overall: 'bg-signal-teal/15 text-signal-teal border-signal-teal/30',
  lowest_price: 'bg-signal-indigo/10 text-signal-indigo border-signal-indigo/25',
  fastest_delivery: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
  top_rated: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25',
  biggest_discount: 'bg-signal-ember/10 text-signal-ember border-signal-ember/25',
  free_delivery: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  nearest: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25',
};

export function ResultBadgePill({ badge }: { badge: ResultBadge }) {
  const Icon = ICONS[badge];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
        STYLES[badge]
      )}
    >
      <Icon className="h-3 w-3" />
      {BADGE_LABELS[badge]}
    </span>
  );
}
