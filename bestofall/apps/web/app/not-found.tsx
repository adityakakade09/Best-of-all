import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-6xl font-bold text-signal-indigo">404</p>
      <h1 className="font-display text-xl font-semibold">This page didn&apos;t make the comparison</h1>
      <p className="text-sm text-ink-muted dark:text-ink-muted-dark">
        The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back to searching.
      </p>
      <Link href="/" className="btn-primary">
        Back to search
      </Link>
    </div>
  );
}
