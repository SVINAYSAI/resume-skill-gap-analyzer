export const MAX_FILE_SIZE_MB = 5
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const MIN_PASTE_TEXT_LENGTH = 20
export const MIN_EXTRACTED_TEXT_LENGTH = 50

export const ACCEPTED_MIME_TYPES = ['application/pdf', 'text/plain']
export const ACCEPTED_EXTENSIONS = ['.pdf', '.txt']

export const VERDICT_LABELS = {
  QUALIFIED: 'Qualified',
  ALMOST_THERE: 'Almost There',
  NOT_YET: 'Not Yet',
}

export const VERDICT_THRESHOLDS = {
  QUALIFIED: 75,
  ALMOST_THERE: 40,
}

export function getVerdictTier(percentage) {
  if (percentage >= VERDICT_THRESHOLDS.QUALIFIED) {
    return {
      label: VERDICT_LABELS.QUALIFIED,
      color: 'emerald',
      bgClass: 'bg-emerald-50',
      textClass: 'text-emerald-700',
      borderClass: 'border-emerald-200',
      ringColor: '#10b981',
      icon: 'CheckCircle',
    }
  }
  if (percentage >= VERDICT_THRESHOLDS.ALMOST_THERE) {
    return {
      label: VERDICT_LABELS.ALMOST_THERE,
      color: 'amber',
      bgClass: 'bg-amber-50',
      textClass: 'text-amber-700',
      borderClass: 'border-amber-200',
      ringColor: '#f59e0b',
      icon: 'AlertCircle',
    }
  }
  return {
    label: VERDICT_LABELS.NOT_YET,
    color: 'rose',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
    ringColor: '#f43f5e',
    icon: 'XCircle',
  }
}
