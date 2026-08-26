'use client';

import { ErrorState } from '@/components/status/error-state';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      actionLabel="Reload module"
      message={error.message}
      onAction={reset}
      title="This module could not be rendered."
    />
  );
}

