import Link from 'next/link';

export function AppLogo() {
  return (
    <Link className="group flex items-center gap-3 transition-opacity hover:opacity-95" href="/dashboard">
      <div className="relative flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 shadow-sm ring-1 ring-white/20">
        <span className="font-mono text-xs font-black tracking-wider text-white">SDMA</span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-xs font-bold uppercase tracking-wider text-white">
            SIH26191
          </p>
          <span className="rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-200 ring-1 ring-slate-700/60">
            Gov Command
          </span>
        </div>
        <p className="truncate text-[11px] font-medium text-slate-400 group-hover:text-slate-300">
          Disaster Decision Support
        </p>
      </div>
    </Link>
  );
}
