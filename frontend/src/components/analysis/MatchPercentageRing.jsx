import { getVerdictTier } from '../../utils/constants.js'

export default function MatchPercentageRing({ percentage, size = 140, strokeWidth = 10 }) {
  const tier = getVerdictTier(percentage)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tier.ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {percentage.toFixed(1)}%
          </span>
          <span className={`text-xs font-medium mt-0.5 ${tier.textClass}`}>
            {tier.label}
          </span>
        </div>
      </div>
    </div>
  )
}