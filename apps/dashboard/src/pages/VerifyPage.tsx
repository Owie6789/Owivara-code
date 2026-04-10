/// <reference types="vite/client" />
import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getCurrentUser } from '@owivara/insforge'
import SEOHead from '../components/SEOHead'

const API_URL = import.meta.env.VITE_INSFORGE_URL

export default function VerifyPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token') ?? ''

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [resendAttempts, setResendAttempts] = useState(0)

  // If token present (from email link), auto-verify
  useEffect(() => {
    if (token) {
      verifyWithToken(token)
    }
  }, [])

  // Rate limit countdown
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // Auto-redirect if already verified
  useEffect(() => {
    if (!token && !email) return
    getCurrentUser().then((user) => {
      if (user && ((user as unknown) as Record<string, unknown>).email_verified) {
        navigate('/login', { state: { message: 'Email verified! You can now sign in.' } })
      }
    })
  }, [navigate, token, email])

  const verifyWithToken = async (t: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/auth/v1/verify-email?token=${t}`, {
        method: 'GET',
      })
      const data = await res.json()

      if (!res.ok) {
        const msg = data.error?.message || data.error_description || 'Verification link is invalid or expired. Please request a new one.'
        setError(msg)
      } else {
        setSuccess('Email verified successfully!')
        setTimeout(() => navigate('/login', { state: { message: 'Email verified! You can now sign in.' } }), 1500)
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return
    // Rate limit: max 3 attempts before 5-minute cooldown
    if (resendAttempts >= 3) {
      setError('Too many resend attempts. Please wait 5 minutes or contact support.')
      setCountdown(300)
      return
    }

    setError('')
    setResendLoading(true)
    setCountdown(30)

    try {
      const res = await fetch(`${API_URL}/auth/v1/resend-verification-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        const msg = data.error?.message || 'Failed to resend verification email. Please try again.'
        setError(msg)
        setCountdown(0)
      } else {
        setResendAttempts(prev => prev + 1)
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
      setCountdown(0)
    } finally {
      setResendLoading(false)
    }
  }

  if (!email && !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0C10] px-4">
        <div className="text-center text-gray-400">
          <p className="text-lg">No email provided.</p>
          <Link to="/signup" className="mt-4 inline-block text-green-400 hover:text-green-300">Go back to signup</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEOHead title="Verify Email — Owivara" description="Verify your email address to activate your Owivara account." path="/verify" noindex={true} />
      <div className="flex min-h-screen items-center justify-center bg-[#0B0C10] px-4">
        {/* Back to signup link */}
        <Link to="/signup" className="absolute top-6 left-6 flex items-center text-sm text-gray-400 hover:text-white">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="w-full max-w-sm">
          {/* Mobile header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 border border-green-500/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2V6M8 6H16C17.1046 6 18 6.89543 18 8V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V8C6 6.89543 6.89543 6 8 6ZM9.5 12H9.51M14.5 12H14.51M5 10H3C2.44772 10 2 10.4477 2 11V15C2 15.5523 2.44772 16 3 16H5M19 10H21C21.5523 10 22 10.4477 22 11V15C22 15.5523 21.5523 16 21 16H19" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Owivara</h2>
          </div>

          {/* Verification form card */}
          <div className="rounded-2xl border border-white/10 bg-[#0D0E12] p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">Verify your email</h2>
              {email && (
                <>
                  <p className="mt-2 text-sm text-gray-500">We sent a verification link to</p>
                  <p className="mt-1 text-sm font-medium text-green-400">{email}</p>
                </>
              )}
              {!email && token && (
                <p className="mt-2 text-sm text-gray-500">Verifying your email via link...</p>
              )}
            </div>

            {/* Info box about verification flow */}
            <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
              <p className="text-sm text-blue-300">
                Check your inbox for a <strong>verification link</strong>. Click the link to verify your email — no code needed.
              </p>
            </div>

            {/* Loading state when verifying via token */}
            {token && loading && (
              <div className="text-center py-6">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-green-500/30 border-t-green-500" />
                <p className="text-sm text-gray-400">Verifying your email...</p>
              </div>
            )}

            {/* Success state */}
            {success && !token && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400 text-center">
                {success}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            {/* Resend verification email */}
            {email && (
              <div className="mt-6 text-center space-y-3">
                <p className="text-sm text-gray-500">
                  Didn't receive the link?{' '}
                  {countdown > 0 ? (
                    <span className="text-gray-600">Resend in {countdown}s</span>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={resendLoading || resendAttempts >= 3}
                      className="text-green-400 hover:text-green-300 font-medium transition-colors disabled:opacity-50"
                    >
                      {resendLoading ? 'Sending...' : 'Resend link'}
                    </button>
                  )}
                </p>
                {resendAttempts > 0 && (
                  <p className="text-xs text-gray-600">{resendAttempts}/3 resend attempts used</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
