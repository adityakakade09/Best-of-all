'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { SearchResultItem } from '@bestofall/shared';
import { getPlatform } from '@bestofall/shared';
import { SignalRing } from '@/components/ui/SignalRing';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import { ResultBadgePill } from '@/components/ui/ResultBadgePill';
import { formatDistance, formatEta, formatInr } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Heart, MapPin, Star, Truck } from 'lucide-react';

interface ResultCardProps {
  item: SearchResultItem;
  isWishlisted?: boolean;
  onToggleWishlist?: (item: SearchResultItem) => void;
  onOrderNow?: (item: SearchResultItem) => void;
  index?: number;
}

export function ResultCard({ item, isWishlisted, onToggleWishlist, onOrderNow, index = 0 }: ResultCardProps) {
  const platform = getPlatform(item.platformId);
  const isBest = item.badges?.includes('best_overall');

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: 'easeOut' }}
      className={cn(
        'glass-panel glass-panel-hover relative flex flex-col rounded-xl3 overflow-hidden',
        isBest && 'shadow-beam ring-1 ring-signal-teal/40'
      )}
    >
      {isBest && (
        <div className="absolute left-0 right-0 top-0 z-10 bg-gradient-to-r from-signal-teal to-signal-indigo px-4 py-1.5 text-center text-xs font-semibold text-white">
          ✨ BestOfAll Pick — great value across price, speed & rating
        </div>
      )}

      <div className={cn('relative aspect-square w-full bg-black/5 dark:bg-white/5', isBest && 'mt-7')}>
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover"
        />
        {!item.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink">
              Currently unavailable
            </span>
          </div>
        )}
        <button
          onClick={() => onToggleWishlist?.(item)}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-pressed={isWishlisted}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 dark:bg-black/50 backdrop-blur-md shadow-glass transition-transform hover:scale-110"
        >
          <Heart className={cn('h-4 w-4', isWishlisted ? 'fill-signal-ember text-signal-ember' : 'text-ink dark:text-ink-inverse')} />
        </button>
        <div className="absolute left-3 top-3">
          {platform && <PlatformBadge platform={platform} />}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{item.title}</h3>
          <SignalRing score={item.signalScore} isBest={isBest} size={44} className="shrink-0" />
        </div>

        {item.badges && item.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.badges
              .filter((b) => b !== 'best_overall')
              .slice(0, 3)
              .map((b) => (
                <ResultBadgePill key={b} badge={b} />
              ))}
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <span className="font-mono text-lg font-bold tabular-nums">{formatInr(item.price)}</span>
          {item.originalPrice && (
            <span className="font-mono text-xs text-ink-muted dark:text-ink-muted-dark line-through tabular-nums">
              {formatInr(item.originalPrice)}
            </span>
          )}
          {item.discountPercent && (
            <span className="text-xs font-semibold text-signal-ember">{item.discountPercent}% off</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted dark:text-ink-muted-dark">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {item.rating.toFixed(1)}
            <span className="opacity-70">({item.ratingCount.toLocaleString('en-IN')})</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" />
            {formatEta(item.etaMinutes)}
            {item.freeDeliveryEligible ? ' · Free' : ` · ${formatInr(item.deliveryFee)}`}
          </span>
          {item.distanceKm !== undefined && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {formatDistance(item.distanceKm)}
            </span>
          )}
        </div>

        <button
          onClick={() => onOrderNow?.(item)}
          disabled={!item.inStock}
          className="btn-primary mt-auto w-full"
        >
          Order Now
        </button>
      </div>
    </motion.article>
  );
}
