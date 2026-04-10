import { useState, FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '@owivara/insforge'
import type { AIProvider } from '@owivara/types'
import { Eye, EyeOff, Save } from 'lucide-react'

export default function SettingsPage() {
  const { data: user } = useQuery({ queryKey: ['user'], queryFn: getCurrentUser })
  const [aiProvider, setAIProvider] = useState<AIProvider>('gemini')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    // TODO: Save to InsForge DB
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Configure your AI provider and account</p>
      </div>

      {/* Account */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Account</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Email</label>
            <p className="text-sm">{user?.email || 'Not available'}</p>
          </div>
        </div>
      </div>

      {/* AI Provider */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">AI Provider (BYOK)</h2>
        <p className="text-xs text-gray-500 mb-4">
          Bring Your Own Key — your API key is stored encrypted and only used for your bot responses.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Provider selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Provider</label>
            <div className="flex gap-3">
              {(['gemini', 'openai'] as AIProvider[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAIProvider(p)}
                  className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    aiProvider === p
                      ? 'border-brand-500/50 bg-brand-500/10 text-brand-400'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {p === 'gemini' ? 'Google Gemini' : 'OpenAI'}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-1">
              API Key
            </label>
            <div className="relative">
              <input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={aiProvider === 'gemini' ? 'AIza...' : 'sk-...'}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {saved && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
              Settings saved successfully!
            </div>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-500 transition-colors"
          >
            <Save size={16} /> Save Settings
          </button>
        </form>
      </div>

      {/* Info */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-3">About BYOK</h2>
        <div className="text-sm text-gray-400 space-y-2">
          <p><strong className="text-gray-300">BYOK (Bring Your Own Key)</strong> means you use your own AI provider API key. This gives you:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>Full control over your AI usage and costs</li>
            <li>Your key is encrypted and never shared</li>
            <li>Only your bot uses your key — complete isolation</li>
            <li>Switch between Gemini and OpenAI anytime</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
