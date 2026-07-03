'use client';

import { useEffect, useState } from 'react';
import {
  AdminOverviewStats,
  PlatformPerformance,
  SearchTrendPoint,
  TrendingSearchEntry,
} from '@bestofall/shared';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { StatCard } from '@/components/admin/StatCard';
import { SearchTrendChart } from '@/components/admin/SearchTrendChart';
import { PlatformPerformanceTable, TrendingSearchesList } from '@/components/admin/AdminTables';
import { api } from '@/lib/apiClient';
import { LayoutDashboard, Search, TrendingUp, Users, Zap } from 'lucide-react';

function AdminContent() {
  const [overview, setOverview] = useState<AdminOverviewStats | null>(null);
  const [trend, setTrend] = useState<SearchTrendPoint[]>([]);
  const [platforms, setPlatforms] = useState<PlatformPerformance[]>([]);
  const [trending, setTrending] = useState<TrendingSearchEntry[]>([]);

  useEffect(() => {
    api.get<AdminOverviewStats>('/admin/overview').then(setOverview).catch(() => undefined);
    api.get<SearchTrendPoint[]>('/admin/search-trend').then(setTrend).catch(() => undefined);
    api.get<PlatformPerformance[]>('/admin/platform-performance').then(setPlatforms).catch(() => undefined);
    api.get<TrendingSearchEntry[]>('/admin/trending-searches').then(setTrending).catch(() => undefined);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-signal-indigo/10 text-signal-indigo">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold">Admin dashboard</h1>
          <p className="text-sm text-ink-muted dark:text-ink-muted-dark">Platform health, search trends & analytics.</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total users" value={overview?.totalUsers ?? '—'} icon={Users} accent="indigo" />
        <StatCard label="Searches today" value={overview?.searchesToday ?? '—'} icon={Search} accent="teal" />
        <StatCard label="Order redirects" value={overview?.totalOrderRedirects ?? '—'} icon={TrendingUp} accent="ember" />
        <StatCard label="Avg response" value={overview ? `${overview.avgResponseTimeMs}ms` : '—'} icon={Zap} accent="indigo" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <SearchTrendChart data={trend} />
        <TrendingSearchesList entries={trending} />
      </div>

      <PlatformPerformanceTable rows={platforms} />
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard adminOnly>
      <AdminContent />
    </AuthGuard>
  );
}
