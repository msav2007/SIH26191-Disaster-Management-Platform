import Link from 'next/link';

export function AppLogo() {
  return (
    <Link className="group flex items-center gap-3 transition-opacity hover:opacity-95" href="/dashboard">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-md shadow-cyan-900/30 ring-1 ring-white/20">
        <span className="font-mono text-xs font-black tracking-wider text-white">SDMA</span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-xs font-bold uppercase tracking-wider text-white">
            SIH26191
          </p>
          <span className="rounded bg-cyan-950/80 px-1 py-0.2 font-mono text-[9px] font-bold text-cyan-300 ring-1 ring-cyan-500/30">
            Gov Command
          </span>
        </div>
        <p className="truncate text-xs font-medium text-slate-400 group-hover:text-slate-300">
          Disaster Management Platform
        </p>
      </div>
    </Link>
  );
}
