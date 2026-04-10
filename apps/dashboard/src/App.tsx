import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '@owivara/insforge'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import VerifyPage from './pages/VerifyPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import BotPage from './pages/BotPage'
import SettingsPage from './pages/SettingsPage'

// Layout
import DashboardLayout from './components/dashboard/DashboardLayout'

/**
 * Protected route wrapper.
 *
 * Auth logic:
 * - InsForge blocks unverified email/password users at login time (returns error)
 * - Google OAuth users are auto-verified on creation
 * - So if isAuthenticated() is true, the user has a valid verified session
 * - No need to check email_verified separately — it causes false negatives
 *   because InsForge's getCurrentUser() doesn't always include email_verified
 *
 * Session expiry: polls every 60s to detect expired sessions. If the session
 * expires while the user is on a protected page, they'll be redirected to login.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'verified' | 'unauthed'>('loading')

  const handleSessionExpired = useCallback(() => {
    navigate('/login', { state: { expired: true } })
  }, [navigate])

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      const authed = await isAuthenticated()
      if (!mounted) return

      if (!authed) {
        handleSessionExpired()
        return
      }

      setStatus('verified')
    }

    checkAuth()

    // Poll every 60 seconds to detect expired sessions
    const interval = setInterval(checkAuth, 60_000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [handleSessionExpired])

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

  if (status === 'unauthed') return <Navigate to="/login" replace state={{ expired: true }} />
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
      <Route path="/reset-password" element={<ResetPasswordPage />} />

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
