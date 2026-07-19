import { NavLink } from 'react-router-dom'
import { FileSearch, Gavel, FileText } from 'lucide-react'
import HealthIndicator from './HealthIndicator.jsx'

const navItems = [
  { to: '/skill-gap', label: 'Skill Gap Analysis', icon: FileSearch },
  { to: '/fit-verdict', label: 'Fit Verdict', icon: Gavel },
]

export default function Sidebar({ onNavigate }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 text-sm leading-tight">Skill Gap</h1>
            <p className="text-xs text-slate-500 leading-tight">Checker & Verdict</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <HealthIndicator />
      </div>
    </div>
  )
}
