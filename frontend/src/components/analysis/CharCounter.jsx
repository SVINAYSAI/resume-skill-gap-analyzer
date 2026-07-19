import { MIN_PASTE_TEXT_LENGTH } from '../../utils/constants.js'

export default function CharCounter({ count }) {
  const met = count >= MIN_PASTE_TEXT_LENGTH

  return (
    <div className="flex items-center justify-between">
      <span
        className={`text-xs ${
          met ? 'text-emerald-600' : 'text-slate-400'
        }`}
      >
        {count} / {MIN_PASTE_TEXT_LENGTH} minimum
      </span>
      {met && (
        <span className="text-xs text-emerald-600 font-medium">Minimum met</span>
      )}
    </div>
  )
}