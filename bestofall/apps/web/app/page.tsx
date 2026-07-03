'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PLATFORMS } from '@bestofall/shared';
import { SearchBar } from '@/components/search/SearchBar';
import { CategoryChips } from '@/components/search/CategoryChips';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Gauge, ShieldCheck, Sparkles, Zap } from 'lucide-react';

const FEATURES = [
  {
    icon: Gauge,
    title: 'Signal Score, not guesswork',
    body: 'Every result gets one composite score blending price, speed, rating, and discount — so the best pick is obvious at a glance.',
  },
  {
    icon: Zap,
    title: 'Every platform, one search',
    body: 'Amazon, Flipkart, Swiggy, Zomato, Blinkit, Zepto, BigBasket and more — merged into a single, sortable comparison.',
  },
  {
    icon: ShieldCheck,
    title: 'Sign in with just your number',
    body: 'Mobile number, name, and an OTP. No passwords, no forms — you\u2019re searching in under 30 seconds.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const geo = useGeolocation();

  const handleSearch = (query: string) => {
    const params = new URLSearchParams({ q: query });
    if (geo.location) {
      params.set('lat', String(geo.location.lat));
      params.set('lng', String(geo.location.lng));
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-16 sm:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-3 flex w-fit items-center gap-1.5 rounded-full glass-panel px-3.5 py-1.5 text-xs font-medium text-ink-muted dark:text-ink-muted-dark"
      >
        <Sparkles className="h-3.5 w-3.5 text-signal-teal" />
        Comparing 14+ platforms in real time
      </motion.div>

      <h1 className="text-balance text-center font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
        Search once.
        <br />
        <span className="bg-gradient-to-r from-signal-indigo to-signal-teal bg-clip-text text-transparent">
          Compare everywhere.
        </span>
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-balance text-center text-ink-muted dark:text-ink-muted-dark">
        Pizza, iPhones, milk, medicines, sneakers, gifts — find them across every delivery and shopping app at
        once, ranked by what actually matters.
      </p>

      <div className="mx-auto mt-10 max-w-2xl">
        <SearchBar
          onSearch={handleSearch}
          onRequestLocation={geo.request}
          locationStatus={geo.status}
        />
      </div>

      <div className="mt-6">
        <CategoryChips onSelect={(cat) => router.push(cat ? `/search?category=${cat}` : '/search')} />
      </div>

      <div className="mt-16">
        <p className="mb-5 text-center text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
          Aggregating results from
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {PLATFORMS.map((p) => (
            <span
              key={p.id}
              className="chip !py-1.5 text-xs"
              style={{ borderColor: `${p.color}33` }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-24 grid gap-5 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="glass-panel rounded-xl3 p-6"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-signal-indigo/15 to-signal-teal/15">
              <Icon className="h-5 w-5 text-signal-indigo" />
            </div>
            <h3 className="mb-1.5 font-display text-lg font-semibold">{title}</h3>
            <p className="text-sm text-ink-muted dark:text-ink-muted-dark">{body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
