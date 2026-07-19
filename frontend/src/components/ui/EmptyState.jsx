import { FileSearch } from 'lucide-react'

export default function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <FileSearch className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-medium text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-xs">{description}</p>
    </div>
  )
}