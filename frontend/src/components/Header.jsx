export default function Header({ health }) {
  const dot =
    health === 'online' ? 'bg-emerald-400'
    : health === 'offline' ? 'bg-rose-500'
    : 'bg-amber-400 animate-pulse'

  return (
    <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-wide text-slate-100">
            VOLATILITY 3
          </h1>
          <p className="text-xs text-slate-400">Memory Forensics Platform</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className={`h-2 w-2 rounded-full ${dot}`} />
          <span>Backend: {health}</span>
        </div>
      </div>
    </header>
  )
}