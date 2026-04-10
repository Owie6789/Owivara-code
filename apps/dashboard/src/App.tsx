import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { isAuthenticated, isEmailVerified, getCurrentUserEmail } from '@owivara/insforge'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import VerifyPage from './pages/VerifyPage'
import DashboardPage from './pages/DashboardPage'
import BotPage from './pages/BotPage'
import SettingsPage from './pages/SettingsPage'

// Layout
import DashboardLayout from './components/dashboard/DashboardLayout'

/** Protected route wrapper with email verification check */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'unverified' | 'verified' | 'unauthed'>('loading')
  const [verifyUrl, setVerifyUrl] = useState('/verify')

  useEffect(() => {
    Promise.all([isAuthenticated(), isEmailVerified(), getCurrentUserEmail()]).then(([authed, verified, email]) => {
      if (!authed) {
        setStatus('unauthed')
      } else if (!verified) {
        setVerifyUrl(`/verify?email=${encodeURIComponent(email ?? '')}`)
        setStatus('unverified')
      } else {
        setStatus('verified')
      }
    })
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0C10]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="mt-4 text-sm text-gray-400">Loading Owivara...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthed') return <Navigate to="/login" replace />
  if (status === 'unverified') return <Navigate to={verifyUrl} replace />
  return <>{children}</>
}

/** Main App component with routing */
export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify" element={<VerifyPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="bots" element={<BotPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
