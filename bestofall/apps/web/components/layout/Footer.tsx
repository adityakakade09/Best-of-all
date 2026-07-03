import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-black/5 dark:border-white/10 px-4 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center text-sm text-ink-muted dark:text-ink-muted-dark sm:flex-row sm:justify-between sm:text-left">
        <p>&copy; {new Date().getFullYear()} BestOfAll. One search, every platform.</p>
        <div className="flex gap-5">
          <Link href="/" className="hover:text-signal-indigo">Search</Link>
          <Link href="/wishlist" className="hover:text-signal-indigo">Wishlist</Link>
          <Link href="/profile" className="hover:text-signal-indigo">Profile</Link>
        </div>
      </div>
    </footer>
  );
}
