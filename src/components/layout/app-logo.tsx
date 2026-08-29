import Link from 'next/link';

export function AppLogo() {
  return (
    <Link className="group flex items-center gap-3 transition-opacity hover:opacity-95" href="/dashboard">
      <div className="flex size-9.5 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs ring-1 ring-white/20">
        <span className="font-mono text-xs font-black tracking-wider text-white">SDMA</span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-xs font-bold uppercase tracking-wider text-white">
            SIH26191
          </p>
          <span className="rounded-sm bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-slate-300 ring-1 ring-slate-700">
            Gov DSS
          </span>
        </div>
        <p className="truncate text-[11px] font-medium text-slate-400 group-hover:text-slate-300">
          Disaster Management Platform
        </p>
      </div>
    </Link>
  );
}
