const LABELS = {
  idle: 'Idle',
  preparing: 'Preparing…',
  running: 'Running…',
  completed: 'Completed',
  failed: 'Failed',
}

export default function StatusIndicator({ status }) {
  const styles = {
    idle: 'bg-slate-500',
    preparing: 'bg-amber-400 animate-pulse',
    running: 'bg-cyan-400 animate-pulse',
    completed: 'bg-emerald-400',
    failed: 'bg-rose-500',
  }
  return (
    <div className="flex items-center gap-2 text-xs text-slate-300">
      <span className={`h-2 w-2 rounded-full ${styles[status]}`} />
      <span>{LABELS[status]}</span>
    </div>
  )
}