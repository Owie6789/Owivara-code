/// <reference types="vite/client" />
import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getCurrentUser, getCurrentUserEmail, signOut } from '@owivara/insforge'
import SEOHead from '../components/SEOHead'

const API_URL = import.meta.env.VITE_INSFORGE_URL

export default function VerifyPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const urlEmail = searchParams.get('email') ?? ''

  const [email, setEmail] = useState(urlEmail)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [resendAttempts, setResendAttempts] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // If no email in URL, try to get it from the logged-in session
  useEffect(() => {
    if (urlEmail) {
      setEmail(urlEmail)
      return
    }
    getCurrentUserEmail().then((e) => {
      if (e) {
        setEmail(e)
        setIsAuthenticated(true)
      }
    })
  }, [urlEmail])

  // Auto-resend code when page loads (user was redirected here as unverified)
  useEffect(() => {
    if (!email || resendAttempts > 0) return
    // Auto-send a fresh verification code
    handleResend()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  // Auto-redirect if already verified
  useEffect(() => {
    if (!email) return
    getCurrentUser().then((user) => {
      if (user && ((user as unknown) as Record<string, unknown>).email_verified) {
        navigate('/dashboard')
      }
    })
  }, [navigate, email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('No email address found. Please sign up again.')
      return
    }
    if (!code || code.length < 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/email/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      })
      const data = await res.json()

      if (!res.ok) {
        const msg = data.error?.message || data.message || 'Invalid or expired verification code.'
        setError(msg)
      } else {
        setSuccess('Email verified successfully!')
        setTimeout(() => navigate('/dashboard'), 1500)
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
      // InsForge's send-verification endpoint uses email to identify the user
      const res = await fetch(`${API_URL}/api/auth/email/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data2 = await res.json()

      if (!res.ok) {
        const msg = data2.error?.message || data2.message || 'Failed to resend verification code. Please try again.'
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

  if (!email) {
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
      <SEOHead title="Verify Email — Owivara" description="Enter the 6-digit verification code sent to your email." path="/verify" noindex={true} />
      <div className="flex min-h-screen items-center justify-center bg-[#0B0C10] px-4">
        {/* Top action link */}
        <div className="absolute top-6 left-6 flex items-center gap-4">
          {isAuthenticated ? (
            <button onClick={async () => { await signOut(); navigate('/login') }} className="text-sm text-gray-400 hover:text-white">
              Sign out
            </button>
          ) : (
            <Link to="/signup" className="flex items-center text-sm text-gray-400 hover:text-white">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
          )}
        </div>

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
              <p className="mt-2 text-sm text-gray-500">We sent a 6-digit code to</p>
              <p className="mt-1 text-sm font-medium text-green-400">{email}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="code" className="mb-1.5 block text-xs font-medium text-gray-400">
                  Verification code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="000000"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 text-center tracking-widest text-lg"
                  autoComplete="one-time-code"
                />
              </div>

              {/* Success message */}
              {success && (
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

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            {/* Resend code */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Didn't receive the code?{' '}
                {countdown > 0 ? (
                  <span className="text-gray-600">Resend in {countdown}s</span>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resendLoading || resendAttempts >= 3}
                    className="text-green-400 hover:text-green-300 font-medium transition-colors disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending...' : 'Resend code'}
                  </button>
                )}
              </p>
              {resendAttempts > 0 && (
                <p className="mt-2 text-xs text-gray-600">{resendAttempts}/3 resend attempts used</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
