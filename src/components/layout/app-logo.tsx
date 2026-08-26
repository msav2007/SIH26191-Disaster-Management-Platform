import Link from 'next/link';

export function AppLogo() {
  return (
    <Link className="flex items-center gap-3" href="/dashboard">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-sm font-bold text-white">
        DM
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-inverse)]">
          SIH26191
        </p>
        <p className="truncate text-sm text-slate-300">Disaster Management Platform</p>
      </div>
    </Link>
  );
}

