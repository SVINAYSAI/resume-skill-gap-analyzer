export default function Tabs({ options, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex bg-slate-100 rounded-lg p-1 ${className}`} role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            value === opt.value
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}