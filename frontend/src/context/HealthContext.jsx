import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getHealth } from '../api/analysisService.js'
import { logError } from '../utils/logger.js'

const HealthContext = createContext(null)

export function HealthProvider({ children }) {
  const [status, setStatus] = useState('unknown')
  const [info, setInfo] = useState(null)
  const [checking, setChecking] = useState(false)

  const checkHealth = useCallback(async () => {
    setChecking(true)
    try {
      const data = await getHealth()
      if (data.status === 'ok') {
        setStatus('ok')
        setInfo(data)
      } else {
        setStatus('error')
      }
    } catch (err) {
      logError('health-check', err)
      setStatus('error')
      setInfo(null)
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    checkHealth()
  }, [checkHealth])

  return (
    <HealthContext.Provider value={{ status, info, checking, checkHealth }}>
      {children}
    </HealthContext.Provider>
  )
}

export function useHealth() {
  const ctx = useContext(HealthContext)
  if (!ctx) throw new Error('useHealth must be used within HealthProvider')
  return ctx
}
