'use client';

import { ErrorState } from '@/components/status/error-state';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorState
          actionLabel="Retry"
          message={error.message}
          onAction={reset}
          title="A fatal application error occurred."
        />
      </body>
    </html>
  );
}

