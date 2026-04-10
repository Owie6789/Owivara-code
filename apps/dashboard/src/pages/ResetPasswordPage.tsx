import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { sendPasswordReset } from '@owivara/insforge'
import SEOHead from '../components/SEOHead'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!email) {
      setError('Please enter your email address.')
      setLoading(false)
      return
    }

    const result = await sendPasswordReset(email)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSent(true)
      setSuccess('Password reset email sent. Check your inbox.')
    }
  }

  if (sent) {
    return (
      <>
        <SEOHead
          title="Check Your Email — Owivara"
          description="We sent a password reset link to your email."
          path="/reset-password"
          noindex={true}
        />
        <div className="flex min-h-screen items-center justify-center bg-[#0B0C10] px-4">
          <Link to="/login" className="absolute top-6 left-6 flex items-center text-sm text-gray-400 hover:text-white">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to login
          </Link>

          <div className="w-full max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 border border-green-500/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Check your email</h2>
            <p className="mt-2 text-sm text-gray-400">
              We sent a password reset link to
            </p>
            <p className="mt-1 text-sm font-medium text-green-400">{email}</p>
            <p className="mt-6 text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => { setSent(false); setSuccess(''); setError('') }}
                className="text-green-400 hover:text-green-300 font-medium"
              >
                try another email
              </button>
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEOHead
        title="Reset Password — Owivara"
        description="Enter your email to receive a password reset link."
        path="/reset-password"
        noindex={true}
      />
      <div className="flex min-h-screen items-center justify-center bg-[#0B0C10] px-4">
        <Link to="/login" className="absolute top-6 left-6 flex items-center text-sm text-gray-400 hover:text-white">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to login
        </Link>

        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 border border-green-500/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Reset your password</h2>
            <p className="mt-2 text-sm text-gray-400">Enter your email and we'll send you a reset link</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0D0E12] p-6 md:p-8">
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
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
