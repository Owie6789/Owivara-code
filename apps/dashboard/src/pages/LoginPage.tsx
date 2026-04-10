import { useState, useEffect, FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signIn, signInWithOAuth, isEmailVerified } from '@owivara/insforge'
import SEOHead from '../components/SEOHead'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Handle verification success message or session expiry message from router
  useEffect(() => {
    const state = location.state as { message?: string; expired?: boolean } | null
    if (state?.message) setSuccess(state.message)
    if (state?.expired) setSuccess('Your session has expired. Please log in again.')
  }, [location.state])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn(email, password)
    setLoading(false)
    if (result.error) {
      const msg = result.error.message.toLowerCase()
      // If InsForge blocks login due to unverified email, redirect to verify
      if (msg.includes('email') && (msg.includes('verif') || msg.includes('confirm'))) {
        navigate(`/verify?email=${encodeURIComponent(email)}`)
      } else {
        setError(result.error.message)
      }
    } else {
      // Check if email is verified (some backends allow login but flag verification)
      const verified = await isEmailVerified()
      if (!verified) {
        navigate(`/verify?email=${encodeURIComponent(email)}`)
      } else {
        navigate('/dashboard', { state: { message: 'Signed in successfully!' } })
      }
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setOauthLoading(true)
    const { url, error } = await signInWithOAuth('google', window.location.origin + '/dashboard')
    setOauthLoading(false)
    if (error) setError(error)
    else if (url) window.location.href = url
  }

  return (
    <>
      <SEOHead
        title="Login — Owivara"
        description="Sign in to your Owivara WhatsApp bot control panel."
        path="/login"
        noindex={true}
      />
      <div className="flex min-h-screen bg-[#0B0C10]">

      {/* ── Left branding panel (hidden on mobile) ── */}
      <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center border-r border-white/5 bg-[#0D0E12] px-12 py-16">
        <div className="max-w-sm text-center">
          {/* Logo mark */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/20 border border-green-500/30">
            {/* Bot SVG icon inline */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2V6M8 6H16C17.1046 6 18 6.89543 18 8V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V8C6 6.89543 6.89543 6 8 6ZM9.5 12H9.51M14.5 12H14.51M5 10H3C2.44772 10 2 10.4477 2 11V15C2 15.5523 2.44772 16 3 16H5M19 10H21C21.5523 10 22 10.4477 22 11V15C22 15.5523 21.5523 16 21 16H19" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white">Owivara</h1>
          <p className="mt-2 text-sm text-gray-500">WhatsApp Bot Orchestration Platform</p>

          <div className="mt-10 space-y-4 text-left">
            {[
              { icon: '🤖', title: 'Multiple bots, one dashboard', desc: 'Manage all your WhatsApp bots from a single unified view.' },
              { icon: '🔑', title: 'BYOK — bring your own AI key', desc: 'Use your own Gemini or OpenAI key. Full control, full privacy.' },
              { icon: '🛡️', title: 'Private-first by design', desc: "Row-level security means your data never touches anyone else's." },
            ].map((f) => (
              <div key={f.title} className="flex gap-3 rounded-xl border border-white/5 bg-white/3 p-4">
                <span className="text-xl">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-200">{f.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 md:px-12">

        {/* Back to landing link */}
        <div className="mb-8 w-full max-w-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12H4M4 12L10 6M4 12L10 18" />
            </svg>
            Back to Owivara
          </Link>
        </div>

        <div className="w-full max-w-sm">

          {/* Mobile-only header */}
          <div className="mb-8 md:hidden text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 border border-green-500/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2V6M8 6H16C17.1046 6 18 6.89543 18 8V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V8C6 6.89543 6.89543 6 8 6ZM9.5 12H9.51M14.5 12H14.51M5 10H3C2.44772 10 2 10.4477 2 11V15C2 15.5523 2.44772 16 3 16H5M19 10H21C21.5523 10 22 10.4477 22 11V15C22 15.5523 21.5523 16 21 16H19" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Owivara</h2>
          </div>

          {/* Form heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="mt-1 text-sm text-gray-500">Sign in to your Owivara account</p>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={oauthLoading}
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {oauthLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          {/* Divider — FIX: use `bg-[#0B0C10]` which matches the actual page bg, NOT the card bg */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center">
              {/* FIX: bg matches the RIGHT PANEL background, not the card */}
              <span className="bg-[#0B0C10] px-3 text-xs text-gray-600">or continue with email</span>
            </div>
          </div>

          {/* Email + Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-gray-400">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-medium text-gray-400">
                  Password
                </label>
                <Link to="/reset-password" className="text-xs text-gray-600 hover:text-gray-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30"
              />
            </div>

            {/* Success message (from email verification) */}
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
              className="mt-2 w-full rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-green-400 hover:text-green-300 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  )
}
