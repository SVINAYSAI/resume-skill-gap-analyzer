import { MessageSquare } from 'lucide-react'

export default function ReasonsList({ reasons }) {
  if (!reasons || reasons.length === 0) return null

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
      <h4 className="text-sm font-semibold text-slate-800 mb-4">Why this verdict?</h4>
      <ul className="space-y-3">
        {reasons.map((reason, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-700 leading-relaxed">{reason}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}