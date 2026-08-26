export function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-5 shadow-[var(--shadow-soft)]">
        <p className="text-sm font-medium text-[var(--text-muted)]">{message}</p>
      </div>
    </div>
  );
}

