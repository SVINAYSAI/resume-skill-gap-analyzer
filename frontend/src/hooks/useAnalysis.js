import { useState, useCallback } from 'react'

export function useAnalysis(analyzeFn) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const run = useCallback(
    async (payload) => {
      setLoading(true)
      setError(null)
      try {
        const result = await analyzeFn(payload)
        setData(result)
        return result
      } catch (err) {
        setError(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [analyzeFn]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, loading, error, run, reset }
}
