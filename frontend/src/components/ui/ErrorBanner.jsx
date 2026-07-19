import { AlertTriangle } from 'lucide-react'

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null

  return (
    <div
      role="alert"
      className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800"
    >
      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium">Analysis failed</p>
        <p className="text-sm mt-0.5 opacity-90">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-xs font-medium underline hover:no-underline focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1"
        >
          Dismiss
        </button>
      )}
    </div>
  )
}