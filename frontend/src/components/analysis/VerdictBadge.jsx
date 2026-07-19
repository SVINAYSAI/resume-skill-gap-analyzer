import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { getVerdictTier } from '../../utils/constants.js'

const iconMap = {
  emerald: CheckCircle,
  amber: AlertCircle,
  rose: XCircle,
}

export default function VerdictBadge({ percentage }) {
  const tier = getVerdictTier(percentage)
  const Icon = iconMap[tier.color] || AlertCircle

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${tier.bgClass} ${tier.borderClass}`}
    >
      <Icon className={`w-5 h-5 ${tier.textClass}`} />
      <span className={`text-lg font-semibold ${tier.textClass}`}>{tier.label}</span>
    </div>
  )
}