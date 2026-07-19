import { useRef, useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'

export default function FileDropzone({ file, onFileSelect, onFileRemove, error, disabled = false }) {
  const inputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleClick = () => {
    if (!disabled) inputRef.current?.click()
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!disabled) setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled) return
    const dropped = e.dataTransfer.files[0]
    if (dropped) onFileSelect(dropped)
  }

  const handleChange = (e) => {
    const selected = e.target.files[0]
    if (selected) onFileSelect(selected)
    e.target.value = ''
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (file) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[160px] border border-dashed border-indigo-300 bg-indigo-50/50 rounded-lg p-6">
        <FileText className="w-8 h-8 text-indigo-500 mb-3" />
        <p className="text-sm font-medium text-slate-800 text-center break-all max-w-full">
          {file.name}
        </p>
        <p className="text-xs text-slate-500 mt-1">{formatSize(file.size)}</p>
        <button
          onClick={onFileRemove}
          disabled={disabled}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-2 py-1 disabled:opacity-50"
        >
          <X className="w-3.5 h-3.5" />
          Remove file
        </button>
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center h-full min-h-[160px] border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
        isDragOver
          ? 'border-indigo-400 bg-indigo-50/50'
          : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Upload className="w-8 h-8 text-slate-400 mb-3" />
      <p className="text-sm font-medium text-slate-700 text-center">
        Click to browse or drag & drop
      </p>
      <p className="text-xs text-slate-500 mt-1 text-center">
        PDF or TXT up to 5MB
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      {error && (
        <p className="mt-3 text-xs text-rose-600 text-center max-w-full">{error}</p>
      )}
    </div>
  )
}