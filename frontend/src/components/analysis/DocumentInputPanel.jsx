import { useState } from 'react'
import Card from '../ui/Card.jsx'
import Tabs from '../ui/Tabs.jsx'
import CharCounter from './CharCounter.jsx'
import FileDropzone from './FileDropzone.jsx'
import { validatePastedText, validateFile } from '../../utils/validation.js'

const tabOptions = [
  { value: 'text', label: 'Paste text' },
  { value: 'file', label: 'Upload file' },
]

export default function DocumentInputPanel({
  label,
  mode,
  onModeChange,
  value,
  onValueChange,
  disabled = false,
}) {
  const [fileError, setFileError] = useState(null)

  const handleModeChange = (newMode) => {
    onModeChange(newMode)
    setFileError(null)
  }

  const handleTextChange = (e) => {
    onValueChange(e.target.value)
  }

  const handleFileSelect = (file) => {
    const validation = validateFile(file)
    if (!validation.valid) {
      setFileError(validation.message)
      onValueChange(null)
      return
    }
    setFileError(null)
    onValueChange(file)
  }

  const handleFileRemove = () => {
    onValueChange(null)
    setFileError(null)
  }

  const textValidation = mode === 'text' ? validatePastedText(value) : { valid: true }
  const showTextError = mode === 'text' && value.length > 0 && !textValidation.valid

  return (
    <Card className="h-full flex flex-col">
      <div className="p-5 sm:p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-slate-800">{label}</h3>
          <Tabs
            options={tabOptions}
            value={mode}
            onChange={handleModeChange}
          />
        </div>

        <div className="flex-1 min-h-[200px]">
          {mode === 'text' ? (
            <div className="flex flex-col h-full">
              <textarea
                value={value}
                onChange={handleTextChange}
                disabled={disabled}
                placeholder={`Paste your ${label.toLowerCase()} here...`}
                className="flex-1 w-full min-h-[160px] p-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
              />
              <div className="mt-2">
                <CharCounter count={value.length} />
              </div>
              {showTextError && (
                <p className="mt-2 text-xs text-rose-600">{textValidation.message}</p>
              )}
            </div>
          ) : (
            <FileDropzone
              file={value}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              error={fileError}
              disabled={disabled}
            />
          )}
        </div>
      </div>
    </Card>
  )
}