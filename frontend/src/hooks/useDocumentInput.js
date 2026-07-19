import { useState, useCallback } from 'react'

export function useDocumentInput() {
  const [mode, setMode] = useState('text')
  const [value, setValue] = useState('')

  const handleSetMode = useCallback(
    (newMode) => {
      setMode(newMode)
      setValue(newMode === 'text' ? '' : null)
    },
    []
  )

  const clear = useCallback(() => {
    setValue(mode === 'text' ? '' : null)
  }, [mode])

  const normalizedValue =
    mode === 'text' ? { type: 'text', value } : { type: 'file', value }

  return {
    mode,
    setMode: handleSetMode,
    value,
    setValue,
    clear,
    normalizedValue,
  }
}
