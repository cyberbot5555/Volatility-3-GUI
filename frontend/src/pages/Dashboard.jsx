import { useEffect, useState } from 'react'
import MemoryImageSelector from '../components/MemoryImageSelector'
import PluginSelector from '../components/PluginSelector'
import StatusIndicator from '../components/StatusIndicator'
import ResultsTable from '../components/ResultsTable'
import ErrorBanner from '../components/ErrorBanner'
import { extractError, fetchPlugins, runAnalysis } from '../services/api'

export default function Dashboard() {
  const [plugins, setPlugins] = useState([])
  const [pluginId, setPluginId] = useState('')
  const [image, setImage] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetchPlugins()
      .then((list) => {
        setPlugins(list)
        if (list.length) setPluginId(list[0].id)
      })
      .catch((e) => setError(extractError(e)))
  }, [])

  async function handleRun() {
    if (!image || !pluginId) return
    setError(''); setResult(null); setStatus('preparing')
    await new Promise((r) => setTimeout(r, 150))
    setStatus('running')
    try {
      const data = await runAnalysis(image, pluginId)
      setResult(data)
      setStatus('completed')
    } catch (e) {
      setError(extractError(e))
      setStatus('failed')
    }
  }

  const running = status === 'running' || status === 'preparing'
  const canRun = Boolean(image && pluginId) && !running

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 p-6">
      <aside className="col-span-12 space-y-6 lg:col-span-4">
        <MemoryImageSelector value={image} onChange={setImage} />
        <PluginSelector plugins={plugins} value={pluginId} onChange={setPluginId} />
      </aside>

      <main className="col-span-12 space-y-6 lg:col-span-8">
        <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <StatusIndicator status={status} />
          <button
            onClick={handleRun}
            disabled={!canRun}
            className={`rounded px-5 py-2 text-sm font-semibold tracking-wide transition ${
              canRun
                ? 'bg-cyan-500 text-slate-900 hover:bg-cyan-400'
                : 'cursor-not-allowed bg-slate-800 text-slate-500'
            }`}
          >
            {running ? 'Running…' : 'RUN ANALYSIS'}
          </button>
        </div>

        <ErrorBanner message={error} />

        {result && (
          <ResultsTable
            columns={result.columns}
            rows={result.rows}
            raw={result.raw}
          />
        )}

        {!result && !error && (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-800 text-sm text-slate-500">
            Select a memory image and plugin, then press RUN ANALYSIS.
          </div>
        )}
      </main>
    </div>
  )
}