'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/authStore';
import { ThemeToggle } from './ThemeToggle';
import { Heart, Clock, User, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/history', label: 'History', icon: Clock },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleAuthClick = () => {
    if (user) router.push('/profile');
    else router.push('/login');
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 px-4 pt-4"
    >
      <nav className="glass-panel mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-signal-indigo to-signal-teal text-sm text-white">
            B
          </span>
          BestOfAll
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10',
                pathname === href && 'bg-black/5 dark:bg-white/10'
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10',
                pathname === '/admin' && 'bg-black/5 dark:bg-white/10'
              )}
            >
              <LayoutDashboard className="h-4 w-4" /> Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <button onClick={handleAuthClick} className="btn-ghost !px-3.5 !py-2 text-sm">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{user ? user.name.split(' ')[0] : 'Sign in'}</span>
          </button>
          {user && (
            <button onClick={logout} className="hidden text-xs text-ink-muted dark:text-ink-muted-dark hover:underline sm:inline">
              Log out
            </button>
          )}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel mx-auto mt-2 flex max-w-7xl flex-col gap-1 rounded-2xl p-3 md:hidden"
        >
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm text-ink-muted dark:text-ink-muted-dark">Theme</span>
            <ThemeToggle />
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
