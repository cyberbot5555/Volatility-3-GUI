import { useMemo, useState } from 'react'

export default function PluginSelector({ plugins, value, onChange }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return plugins.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.plugin.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    )
  }, [plugins, query])

  const current = plugins.find((p) => p.id === value)

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
        Plugin
      </h2>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded border border-slate-700 bg-slate-950/60 px-3 py-2 text-left text-sm hover:border-cyan-500/40"
      >
        <span className="font-mono text-slate-200">
          {current ? current.plugin : '— select plugin —'}
        </span>
        <span className="text-slate-500">▾</span>
      </button>

      {open && (
        <div className="mt-2 rounded border border-slate-800 bg-slate-950/90 p-2">
          <input
            autoFocus
            placeholder="Search plugins…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mb-2 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs outline-none focus:border-cyan-500"
          />
          <ul className="scrollbar-thin max-h-56 overflow-y-auto">
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => { onChange(p.id); setOpen(false); setQuery('') }}
                  className={`block w-full rounded px-2 py-2 text-left text-xs hover:bg-cyan-500/10 ${
                    p.id === value ? 'bg-cyan-500/15' : ''
                  }`}
                >
                  <div className="font-mono text-cyan-200">{p.plugin}</div>
                  <div className="text-slate-400">{p.description}</div>
                </button>
              </li>
            ))}
            {!filtered.length && (
              <li className="px-2 py-3 text-center text-xs text-slate-500">No match</li>
            )}
          </ul>
        </div>
      )}
    </section>
  )
}