import { RefreshCw } from 'lucide-react'
import { useHealth } from '../../context/HealthContext.jsx'

export default function HealthIndicator() {
  const { status, checking, checkHealth } = useHealth()

  const isConnected = status === 'ok'

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
          aria-hidden="true"
        />
        <span className="text-xs text-slate-500">
          {isConnected ? 'Backend connected' : 'Backend unreachable'}
        </span>
      </div>
      <button
        onClick={checkHealth}
        disabled={checking}
        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
        aria-label="Retry health check"
        title="Retry health check"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
      </button>
    </div>
  )
}
