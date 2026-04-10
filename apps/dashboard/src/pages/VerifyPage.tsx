/// <reference types="vite/client" />
import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getCurrentUser, getCurrentUserEmail, signOut, verifyEmail, resendVerificationEmail } from '@owivara/insforge'
import SEOHead from '../components/SEOHead'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog'
import { AnimatedOTPInput } from '../components/ui/otp-input'

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

  // Real-time countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 0
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

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

  // Auto-redirect if already verified AND has an active session
  useEffect(() => {
    if (!email) return
    let mounted = true
    const checkVerified = async () => {
      try {
        const user = await getCurrentUser()
        if (mounted && user && ((user as unknown) as Record<string, unknown>).email_verified) {
          window.location.href = '/dashboard'
        }
      } catch {
        // No active session — ignore
      }
    }
    checkVerified()
    const interval = setInterval(checkVerified, 5000)
    return () => { mounted = false; clearInterval(interval) }
  }, [navigate, email])

  const handleResend = useCallback(async () => {
    if (!email) return
    if (resendAttempts >= 3) {
      setError('Too many resend attempts. Please wait 5 minutes or contact support.')
      setCountdown(300)
      return
    }

    setError('')
    setResendLoading(true)
    setCountdown(30)

    try {
      const result = await resendVerificationEmail(email)
      if (!result.success) {
        setError(result.error || 'Failed to resend verification code.')
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
  }, [email, resendAttempts])

  const handleOTPComplete = async (otp: string) => {
    setCode(otp)
    if (otp.length < 6) return

    if (!email) {
      setError('No email address found.')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const result = await verifyEmail(email, otp)
      if (!result.success) {
        setError(result.error || 'Invalid or expired verification code.')
      } else {
        setSuccess('Email verified successfully!')
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Email verified successfully! Please sign in.' }
          })
        }, 1000)
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
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
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4">

        {/* Back button */}
        <Link
          to={isAuthenticated ? "/dashboard" : "/signup"}
          className="fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-300"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12H4M4 12L10 6M4 12L10 18" />
          </svg>
          Back
        </Link>

        {/* Owivara logo */}
        <div className="fixed left-4 top-12 z-50 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/20 border border-green-500/30">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2V6M8 6H16C17.1046 6 18 6.89543 18 8V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V8C6 6.89543 6.89543 6 8 6ZM9.5 12H9.51M14.5 12H14.51M5 10H3C2.44772 10 2 10.4477 2 11V15C2 15.5523 2.44772 16 3 16H5M19 10H21C21.5523 10 22 10.4477 22 11V15C22 15.5523 21.5523 16 21 16H19" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-400">Owivara</span>
        </div>

        {/* Verify Dialog */}
        <Dialog open={true} onOpenChange={() => navigate(isAuthenticated ? "/dashboard" : "/signup")}>
          <DialogContent className="border-white/10 bg-[#0d0d0d] text-white shadow-2xl shadow-black/50 sm:max-w-[420px]">
            {/* Header */}
            <div className="flex flex-col items-center gap-3 pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <DialogHeader className="text-center">
                <DialogTitle className="text-xl font-semibold tracking-tight">Verify your email</DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  We sent a 6-digit code to
                </DialogDescription>
                <p className="mt-1 text-sm font-medium text-green-400">{email}</p>
              </DialogHeader>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400 text-center">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-sm text-green-400 text-center">
                    {success}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* OTP Input */}
            <div className="py-4">
              <div className="flex justify-center">
                <AnimatedOTPInput
                  value={code}
                  onChange={setCode}
                  onComplete={handleOTPComplete}
                  maxLength={6}
                />
              </div>
            </div>

            {/* Loading state */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-sm text-gray-500"
                >
                  Verifying code...
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resend code */}
            <div className="text-center">
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

            {/* Sign out if authenticated */}
            {isAuthenticated && (
              <div className="text-center pt-2">
                <button
                  onClick={async () => { await signOut(); navigate('/login') }}
                  className="text-sm text-gray-500 hover:text-gray-300"
                >
                  Sign out
                </button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
