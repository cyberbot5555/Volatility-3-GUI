import { useEffect, useRef, useState } from 'react'
import {
  deleteImage, extractError, fetchImages, uploadImage,
} from '../services/api'

function formatBytes(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`
  return `${(n / 1024 ** 3).toFixed(2)} GB`
}

export default function MemoryImageSelector({ value, onChange }) {
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const fileInput = useRef(null)

  async function refresh() {
    try {
      const list = await fetchImages()
      setImages(list)
      if (!value && list.length) onChange(list[0].name)
    } catch (e) { setError(extractError(e)) }
  }

  useEffect(() => { refresh() /* eslint-disable-next-line */ }, [])

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(''); setUploading(true); setProgress(0)
    try {
      const res = await uploadImage(file, setProgress)
      await refresh()
      onChange(res.name)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  async function handleClear() {
    if (!value) return
    if (!confirm(`Remove "${value}" from server?`)) return
    try {
      await deleteImage(value)
      onChange('')
      await refresh()
    } catch (err) { setError(extractError(err)) }
  }

  const selected = images.find((i) => i.name === value)

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
        Memory Image
      </h2>

      <div className="space-y-3">
        <input
          ref={fileInput}
          type="file"
          accept=".raw,.mem,.dmp,.vmem,.img,.dd"
          onChange={handleUpload}
          disabled={uploading}
          className="block w-full cursor-pointer rounded border border-slate-700 bg-slate-950/60 p-2 text-xs file:mr-3 file:rounded file:border-0 file:bg-cyan-500/20 file:px-3 file:py-1.5 file:text-cyan-200 hover:file:bg-cyan-500/30"
        />

        {uploading && (
          <div className="h-1.5 w-full overflow-hidden rounded bg-slate-800">
            <div className="h-full bg-cyan-400 transition-all"
                 style={{ width: `${progress}%` }} />
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs text-slate-400">
            Or select an existing image
          </label>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950/60 p-2 text-sm"
          >
            <option value="">— none selected —</option>
            {images.map((img) => (
              <option key={img.name} value={img.name}>
                {img.name} · {formatBytes(img.size)}
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <div className="flex items-center justify-between rounded border border-slate-800 bg-slate-950/40 px-3 py-2 text-xs">
            <div>
              <div className="font-mono text-slate-200">{selected.name}</div>
              <div className="text-slate-500">{formatBytes(selected.size)}</div>
            </div>
            <button onClick={handleClear}
              className="rounded border border-rose-500/40 px-2 py-1 text-rose-300 hover:bg-rose-500/10">
              Clear
            </button>
          </div>
        )}

        {error && (
          <div className="rounded border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </div>
        )}
      </div>
    </section>
  )
}