'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas-light px-4 text-center">
        <p className="font-display text-xl font-semibold text-ink">Something went wrong</p>
        <p className="max-w-md text-sm text-ink-muted">
          We hit an unexpected error loading BestOfAll. Try again — if it keeps happening, please let us know.
        </p>
        <button onClick={reset} className="rounded-full bg-signal-indigo px-5 py-2.5 text-sm font-medium text-white">
          Try again
        </button>
      </body>
    </html>
  );
}
