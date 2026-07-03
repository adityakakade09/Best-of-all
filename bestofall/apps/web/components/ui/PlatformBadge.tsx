import { PlatformMeta } from '@bestofall/shared';
import { cn } from '@/lib/cn';

export function PlatformBadge({ platform, className }: { platform: PlatformMeta; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white',
        className
      )}
      style={{ backgroundColor: platform.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
      {platform.name}
    </span>
  );
}
