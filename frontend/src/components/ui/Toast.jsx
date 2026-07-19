import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

export default function Toast({ id, message, type = 'info', onRemove }) {
  const Icon = icons[type] || Info

  const styles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-slate-50 text-slate-800 border-slate-200',
  }

  return (
    <div
      role="status"
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-sm min-w-[280px] max-w-sm ${styles[type] || styles.info}`}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      <button
        onClick={() => onRemove(id)}
        className="p-0.5 rounded hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}