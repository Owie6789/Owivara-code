import { useState, useEffect, FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn, signInWithOAuth, RateLimiter } from '@owivara/insforge'
import SEOHead from '../components/SEOHead'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'

// Client-side rate limiter: 5 login attempts per minute
const loginLimiter = new RateLimiter()

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const state = location.state as { message?: string; expired?: boolean } | null
    if (state?.message) setSuccess(state.message)
    if (state?.expired) setError('Your session has expired. Please log in again.')
  }, [location.state])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!loginLimiter.canAttempt('login', 5, 60_000)) {
      const waitSec = Math.ceil(loginLimiter.timeUntilNextAttempt('login', 60_000) / 1000)
      setError(`Too many login attempts. Please wait ${waitSec}s and try again.`)
      return
    }

    setLoading(true)
    const result = await signIn(email, password)
    setLoading(false)
    if (result.error) {
      const msg = result.error.message.toLowerCase()
      if (msg.includes('email') && (msg.includes('verif') || msg.includes('confirm'))) {
        navigate(`/verify?email=${encodeURIComponent(email)}`)
      } else {
        setError(result.error.message)
      }
    } else {
      const user = result.data as unknown as Record<string, unknown>
      const isVerified = user.emailVerified === true
      if (!isVerified) {
        navigate(`/verify?email=${encodeURIComponent(email)}`)
      } else {
        navigate('/dashboard', { state: { message: 'Signed in successfully!' } })
      }
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setOauthLoading(true)
    
    // Use popup-based OAuth to prevent full-page redirects to InsForge error pages
    const callbackUrl = window.location.origin + '/auth/callback'
    const { url, error } = await signInWithOAuth('google', callbackUrl)
    setOauthLoading(false)
    
    if (error) {
      setError(error)
    } else if (url) {
      // Open OAuth flow in popup so errors stay contained
      const width = 500
      const height = 700
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      const popup = window.open(url, 'oauth-popup', `width=${width},height=${height},left=${left},top=${top}`)
      
      if (!popup) {
        setError('Popup was blocked. Please allow popups and try again.')
        return
      }

      // Poll for popup close
      const checkClosed = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(checkClosed)
            // Check if user is now authenticated
            const checkAuth = async () => {
              try {
                const { getCurrentUser } = await import('@owivara/insforge')
                const user = await getCurrentUser()
                if (user) {
                  navigate('/dashboard', { state: { message: 'Signed in with Google!' } })
                } else {
                  // OAuth may have failed or user closed popup
                  setError('Google sign in was not completed. Please try again.')
                }
              } catch {
                setError('Google sign in was not completed. Please try again.')
              }
            }
            setTimeout(checkAuth, 1000)
          }
        } catch {
          // Cross-origin — popup closed before we could check
          clearInterval(checkClosed)
        }
      }, 500)

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkClosed)
        if (!popup.closed) {
          popup.close()
        }
      }, 300000)
    }
  }

  return (
    <>
      <SEOHead
        title="Login — Owivara"
        description="Sign in to your Owivara WhatsApp bot control panel."
        path="/login"
        noindex={true}
      />

      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">

        {/* Back button */}
        <Link
          to="/"
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

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px] rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl shadow-black/50 sm:p-8"
        >
          {/* Header */}
          <div className="flex flex-col items-center gap-3 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-semibold text-white tracking-tight">Welcome back</h1>
              <p className="mt-1 text-sm text-gray-500">Enter your credentials to login to your account.</p>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="hi@yourcompany.com"
                  className="h-10 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-gray-600 focus-visible:border-green-500/50 focus-visible:ring-green-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="h-10 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-gray-600 focus-visible:border-green-500/50 focus-visible:ring-green-500/20"
                />
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-white/20 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500"
                />
                <Label htmlFor="remember" className="text-sm font-normal text-gray-500">
                  Remember me
                </Label>
              </div>
              <Link to="/reset-password" className="text-sm font-medium text-gray-400 underline underline-offset-4 hover:text-gray-300">
                Forgot password?
              </Link>
            </div>

            {/* Sign in button */}
            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-lg bg-white text-sm font-medium text-[#0a0a0a] hover:bg-white/90 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-600">Or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={oauthLoading}
            className="mt-4 h-10 w-full rounded-lg border-white/10 bg-transparent text-sm font-medium text-white hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {oauthLoading ? 'Connecting...' : 'Login with Google'}
          </Button>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-green-400 hover:text-green-300 transition-colors">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  )
}
