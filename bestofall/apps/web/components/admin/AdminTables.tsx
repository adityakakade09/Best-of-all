import { PlatformPerformance, TrendingSearchEntry } from '@bestofall/shared';
import { getPlatform } from '@bestofall/shared';

export function PlatformPerformanceTable({ rows }: { rows: PlatformPerformance[] }) {
  return (
    <div className="glass-panel overflow-hidden rounded-xl3">
      <div className="p-5 pb-0">
        <h3 className="font-display text-sm font-semibold">Platform performance (24h)</h3>
      </div>
      <div className="overflow-x-auto p-5">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-ink-muted dark:text-ink-muted-dark">
              <th className="py-2 pr-4 font-medium">Platform</th>
              <th className="py-2 pr-4 font-medium">Requests</th>
              <th className="py-2 pr-4 font-medium">Avg latency</th>
              <th className="py-2 font-medium">Error rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {rows.map((r) => {
              const platform = getPlatform(r.platformId);
              return (
                <tr key={r.platformId}>
                  <td className="py-2.5 pr-4 font-medium">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: platform?.color ?? '#999' }} />
                      {platform?.name ?? r.platformId}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 font-mono tabular-nums">{r.requestCount}</td>
                  <td className="py-2.5 pr-4 font-mono tabular-nums">{r.avgLatencyMs}ms</td>
                  <td className="py-2.5 font-mono tabular-nums">
                    <span className={r.errorRate > 0.1 ? 'text-signal-ember' : 'text-signal-teal'}>
                      {(r.errorRate * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TrendingSearchesList({ entries }: { entries: TrendingSearchEntry[] }) {
  const max = Math.max(...entries.map((e) => e.count), 1);
  return (
    <div className="glass-panel rounded-xl3 p-5">
      <h3 className="mb-4 font-display text-sm font-semibold">Trending searches (7d)</h3>
      <div className="flex flex-col gap-2.5">
        {entries.map((e) => (
          <div key={e.query} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-sm font-medium">{e.query}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-signal-indigo to-signal-teal"
                style={{ width: `${(e.count / max) * 100}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right font-mono text-xs tabular-nums text-ink-muted dark:text-ink-muted-dark">
              {e.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
