export default function SkillChip({ children, variant = 'neutral' }) {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border break-words ${variants[variant] || variants.neutral}`}
    >
      {children}
    </span>
  )
}