export default function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="rounded border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
      <div className="font-semibold">Analysis Failed</div>
      <div className="mt-1 whitespace-pre-wrap text-xs">{message}</div>
    </div>
  )
}