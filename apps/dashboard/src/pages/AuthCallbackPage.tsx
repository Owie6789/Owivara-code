import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getCurrentUser, isAuthenticated } from '@owivara/insforge'
import SEOHead from '../components/SEOHead'

/**
 * OAuth Callback Page
 * 
 * Handles redirects from InsForge OAuth providers (Google, etc.)
 * InsForge redirects back here after OAuth completes (success or error).
 * 
 * Query params from InsForge:
 * - success=true + session established → redirect to /dashboard
 * - error=... → show error message, link back to login
 * - insforge_status=success → also success
 * - insforge_error=... → also error
 */
export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      // Check for explicit error params from InsForge
      const insforgeError = searchParams.get('insforge_error')
      const errorParam = searchParams.get('error')
      const insforgeStatus = searchParams.get('insforge_status')
      const successParam = searchParams.get('success')

      // If there's an error param, show the error
      if (insforgeError || errorParam) {
        const errorMsg = insforgeError || errorParam || 'Authentication failed'
        setError(decodeURIComponent(errorMsg.replace(/\+/g, ' ')))
        setChecking(false)
        return
      }

      // If success is indicated, check if we have a valid session
      if (successParam === 'true' || insforgeStatus === 'success') {
        try {
          const authed = await isAuthenticated()
          if (authed) {
            const user = await getCurrentUser()
            if (user) {
              // Session established - redirect to dashboard
              window.location.href = '/dashboard'
              return
            }
          }
          // Auth check failed despite success param
          setError('Could not establish session. Please try signing in manually.')
        } catch {
          setError('Session check failed. Please try signing in manually.')
        }
        setChecking(false)
        return
      }

      // No explicit params - try to detect session (InsForge may have set cookies)
      try {
        const authed = await isAuthenticated()
        if (authed) {
          window.location.href = '/dashboard'
          return
        }
      } catch {
        // No session found
      }

      // No session, no error, no success - fall back to login
      navigate('/login', {
        state: { message: 'OAuth flow completed. Please sign in.' }
      })
    }

    handleCallback()
  }, [searchParams, navigate])

  if (checking) {
    return (
      <>
        <SEOHead
          title="Authenticating — Owivara"
          description="Completing your sign in..."
          path="/auth/callback"
          noindex={true}
        />
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
            <p className="mt-4 text-sm text-gray-400">Completing sign in...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <SEOHead
          title="Sign In Error — Owivara"
          description="There was an error during sign in."
          path="/auth/callback"
          noindex={true}
        />
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4">
          <div className="w-full max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Sign in failed</h2>
            <p className="mt-2 text-sm text-gray-400">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-400"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
              Back to login
            </button>
          </div>
        </div>
      </>
    )
  }

  return null
}
