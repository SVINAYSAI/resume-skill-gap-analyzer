import SkillChip from './SkillChip.jsx'

export default function SkillChipList({ skills, variant = 'neutral', title, emptyText }) {
  if (!skills || skills.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">{title}</h4>
        <p className="text-sm text-slate-500">{emptyText || 'None found.'}</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        <span className="text-xs text-slate-500 font-medium">{skills.length}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <SkillChip key={skill} variant={variant}>
            {skill}
          </SkillChip>
        ))}
      </div>
    </div>
  )
}