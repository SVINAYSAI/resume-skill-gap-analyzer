import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext.jsx'
import { HealthProvider } from './context/HealthContext.jsx'
import AppShell from './components/layout/AppShell.jsx'
import SkillGapPage from './pages/SkillGapPage.jsx'
import FitVerdictPage from './pages/FitVerdictPage.jsx'

function App() {
  return (
    <ToastProvider>
      <HealthProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/skill-gap" replace />} />
            <Route path="/skill-gap" element={<SkillGapPage />} />
            <Route path="/fit-verdict" element={<FitVerdictPage />} />
          </Routes>
        </AppShell>
      </HealthProvider>
    </ToastProvider>
  )
}

export default App
