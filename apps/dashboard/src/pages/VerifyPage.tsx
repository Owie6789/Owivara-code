/// <reference types="vite/client" />
import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getCurrentUser, getCurrentUserEmail, signOut, verifyEmail, resendVerificationEmail } from '@owivara/insforge'
import SEOHead from '../components/SEOHead'
import { AnimatedOTPInput } from '../components/ui/otp-input'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb'

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
        // InsForge returns camelCase: emailVerified
        if (mounted && user && ((user as unknown) as Record<string, unknown>).emailVerified) {
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
      <>
        <SEOHead title="Verification Error — Owivara" description="No email address was provided for verification." path="/verify" noindex={true} />
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">

          {/* Breadcrumb */}
          <div className="fixed left-5 top-5 z-50">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Verify</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Error Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[360px] rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl shadow-black/50 text-center"
          >
            {/* Error Icon */}
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-white tracking-tight" style={{ fontFamily: 'Saans, sans-serif' }}>No email provided</h2>
            <p className="mt-2 text-sm text-gray-500" style={{ fontFamily: 'Saans, sans-serif' }}>
              We couldn't find an email address to verify. This link may have expired or was accessed incorrectly.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-400"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                Go to Sign Up
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Go to Login
              </Link>
            </div>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEOHead title="Verify Email — Owivara" description="Enter the 6-digit verification code sent to your email." path="/verify" noindex={true} />
      <div className="flex min-h-screen items-start justify-center bg-[#0a0a0a] px-4 pt-12">

        {/* Breadcrumb — top left of page */}
        <div className="fixed left-5 top-5 z-50">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/signup">Sign Up</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>
                <BreadcrumbPage>Verify</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Verify Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[360px] rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 shadow-2xl shadow-black/50"
        >
          {/* Header */}
          <div className="flex flex-col items-center gap-2.5 pb-3">
            <img src="/logo.svg" alt="Owivara" className="h-10 w-10 rounded-lg object-cover" />
            <div className="text-center">
              <h1 className="text-lg font-semibold text-white tracking-tight" style={{ fontFamily: 'Saans, sans-serif' }}>Verify your email</h1>
              <p className="mt-0.5 text-xs text-gray-500" style={{ fontFamily: 'Saans, sans-serif' }}>We sent a 6-digit code to</p>
              <p className="mt-0.5 text-xs font-medium text-green-400" style={{ fontFamily: 'Saans, sans-serif' }}>{email}</p>
            </div>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
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
                className="overflow-hidden mb-4"
              >
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-sm text-green-400 text-center">
                  {success}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OTP Input — centered module */}
          <div className="py-6 w-full flex justify-center">
            <div className="flex justify-center w-fit">
              <AnimatedOTPInput
                value={code}
                onChange={setCode}
                onComplete={handleOTPComplete}
                maxLength={6}
                containerClassName="justify-center"
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
                className="text-center text-sm text-gray-500 -mt-2 mb-4"
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
            <div className="text-center mt-4 pt-4 border-t border-white/5">
              <button
                onClick={async () => { await signOut(); navigate('/login') }}
                className="text-sm text-gray-500 hover:text-gray-300"
              >
                Sign out
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}
