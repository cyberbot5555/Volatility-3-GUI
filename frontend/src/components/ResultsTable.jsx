import { useMemo, useState } from 'react'

export default function ResultsTable({ columns, rows, raw }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ col: null, dir: 'asc' })
  const [expanded, setExpanded] = useState(null)
  const [view, setView] = useState('table')   // table | raw | json

  const filtered = useMemo(() => {
    let out = rows
    if (search) {
      const q = search.toLowerCase()
      out = out.filter((r) =>
        columns.some((c) => String(r[c] ?? '').toLowerCase().includes(q))
      )
    }
    if (sort.col) {
      out = [...out].sort((a, b) => {
        const cmp = String(a[sort.col] ?? '').localeCompare(
          String(b[sort.col] ?? ''), undefined, { numeric: true }
        )
        return sort.dir === 'asc' ? cmp : -cmp
      })
    }
    return out
  }, [rows, columns, search, sort])

  function toggleSort(col) {
    setSort((s) =>
      s.col === col
        ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { col, dir: 'asc' }
    )
  }

  function copyAll() {
    navigator.clipboard.writeText(
      filtered.map((r) => columns.map((c) => r[c]).join('\t')).join('\n')
    )
  }

  function exportCsv() {
    const header = columns.join(',')
    const body = filtered
      .map((r) => columns.map((c) =>
        `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const url = URL.createObjectURL(
      new Blob([header + '\n' + body], { type: 'text/csv' })
    )
    const a = document.createElement('a')
    a.href = url
    a.download = 'volatility-result.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/60">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 p-3">
        <div className="flex overflow-hidden rounded border border-slate-700 text-xs">
          {['table', 'raw', 'json'].map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 uppercase tracking-wide ${
                view === v
                  ? 'bg-cyan-500/20 text-cyan-200'
                  : 'text-slate-400 hover:bg-slate-800/60'
              }`}>
              {v}
            </button>
          ))}
        </div>

        {view === 'table' && (
          <>
            <input placeholder="Search…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-auto w-56 rounded border border-slate-700 bg-slate-950/60 px-3 py-1.5 text-xs outline-none focus:border-cyan-500" />
            <button onClick={copyAll}
              className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500/40">
              Copy
            </button>
            <button onClick={exportCsv}
              className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500/40">
              CSV
            </button>
          </>
        )}
      </div>

      {view === 'table' && (
        <div className="scrollbar-thin max-h-[60vh] overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-slate-950/95 text-slate-400">
              <tr>
                <th className="w-6 px-2 py-2" />
                {columns.map((c) => (
                  <th key={c} onClick={() => toggleSort(c)}
                    className="cursor-pointer select-none border-b border-slate-800 px-3 py-2 text-left font-medium uppercase tracking-wide hover:text-cyan-300">
                    {c}{sort.col === c && (sort.dir === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <>
                  <tr key={`r${i}`}
                    className="border-b border-slate-900/70 hover:bg-slate-800/40">
                    <td onClick={() => setExpanded(expanded === i ? null : i)}
                      className="cursor-pointer px-2 text-center text-slate-500">
                      {expanded === i ? '▾' : '▸'}
                    </td>
                    {columns.map((c) => (
                      <td key={c} className="px-3 py-2 font-mono text-slate-200">
                        {String(r[c] ?? '')}
                      </td>
                    ))}
                  </tr>
                  {expanded === i && (
                    <tr key={`x${i}`} className="bg-slate-950/60">
                      <td />
                      <td colSpan={columns.length} className="p-3">
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                          {columns.map((c) => (
                            <div key={c} className="flex gap-2">
                              <dt className="text-slate-500">{c}:</dt>
                              <dd className="font-mono text-slate-200">
                                {String(r[c] ?? '')}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={columns.length + 1}
                      className="py-6 text-center text-slate-500">
                    No rows
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {view === 'raw' && (
        <pre className="scrollbar-thin max-h-[60vh] overflow-auto whitespace-pre p-4 text-xs text-slate-300">
          {raw || '(no raw output)'}
        </pre>
      )}

      {view === 'json' && (
        <pre className="scrollbar-thin max-h-[60vh] overflow-auto p-4 text-xs text-cyan-200">
          {JSON.stringify(filtered, null, 2)}
        </pre>
      )}
    </section>
  )
}