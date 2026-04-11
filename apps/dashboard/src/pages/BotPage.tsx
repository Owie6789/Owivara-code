import { useState, FormEvent, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCurrentUser, getBotInstances, deleteBotInstance, getBotInstance, callCreateInstance } from '@owivara/insforge'
import { Bot, Plus, Trash2, QrCode, X, RefreshCw, Check, Smartphone, AlertCircle, ArrowRight } from 'lucide-react'

// ─── Instruction Steps ─────────────────────────────────────────────────────

const SCAN_STEPS = [
  { num: 1, text: 'Open WhatsApp on your phone' },
  { num: 2, text: 'Tap ⋮ Menu (Android) or Settings (iOS)' },
  { num: 3, text: 'Tap "Linked devices"' },
  { num: 4, text: 'Tap "Link a device"' },
  { num: 5, text: 'Point your phone at the QR code above' },
]

// ─── QR Code Modal ─────────────────────────────────────────────────────────

function QRCodeModal({ botId, botName, userId, onClose }: {
  botId: string
  botName: string
  userId: string
  onClose: () => void
}) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('connecting')
  const [loading, setLoading] = useState(true)
  const [pollCount, setPollCount] = useState(0)
  const [activeTab, setActiveTab] = useState<'qr' | 'link'>('qr')

  const fetchStatus = async () => {
    try {
      const result = await getBotInstance(botId, userId)
      if (result.error) return

      const bot = result.data
      setStatus(bot?.status || 'connecting')
      setPollCount(prev => prev + 1)

      if (bot?.status === 'connected') {
        setQrCode(null)
        setLoading(false)
        return
      }

      if (bot?.qr_code) {
        setQrCode(bot.qr_code)
        setLoading(false)
      } else if (pollCount > 12) {
        // After ~2 minutes of polling with no QR, bot server is likely not running
        setLoading(false)
        setQrCode(null)
      }
    } catch {
      // Silently retry
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [botId, userId])

  // WhatsApp deep link placeholder — populated when phone pairing is available
  // const whatsappLink = `https://wa.me/`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0D0E12] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-white/5 px-6 pt-5 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          <h3 className="text-lg font-semibold text-white">Connect "{botName}"</h3>
          <p className="text-xs text-gray-400 mt-0.5">Link your WhatsApp to this bot</p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/5">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'qr'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <QrCode size={14} className="inline mr-1.5 -mt-0.5" />
            QR Code
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'link'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Smartphone size={14} className="inline mr-1.5 -mt-0.5" />
            Phone Number
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'qr' && (
            <div className="space-y-5">
              {/* QR Code or status */}
              {loading ? (
                <div className="flex flex-col items-center py-10">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-green-500 border-t-transparent mb-4" />
                  <p className="text-sm text-gray-400">Waiting for QR code...</p>
                  <p className="text-xs text-gray-600 mt-1">This may take up to 30 seconds</p>
                </div>
              ) : status === 'connected' ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <Check size={32} className="text-green-400" />
                  </div>
                  <p className="text-green-400 font-semibold">Connected!</p>
                  <p className="text-xs text-gray-500 mt-1">Your bot is ready to use.</p>
                </div>
              ) : status === 'connecting' && !qrCode ? (
                <div className="flex flex-col items-center py-8">
                  <AlertCircle size={40} className="text-yellow-400 mb-4" />
                  <p className="text-yellow-400 font-semibold text-sm">Waiting for bot server...</p>
                  <p className="text-xs text-gray-500 mt-2 text-center max-w-xs">
                    The bot server hasn't started yet. Once your VPS is running, the QR code will appear here automatically.
                  </p>
                  <div className="mt-4 rounded-lg bg-white/5 border border-white/5 px-4 py-3 text-xs text-gray-400">
                    <p className="font-medium text-gray-300 mb-1">Next steps:</p>
                    <p>1. Set up your VPS (see deployment guide)</p>
                    <p>2. Start the bot with PM2</p>
                    <p>3. QR code will appear here in ~10 seconds</p>
                  </div>
                </div>
              ) : qrCode ? (
                <div className="space-y-4">
                  {/* QR Code display */}
                  <div className="rounded-xl bg-white p-4 flex justify-center">
                    <div className="w-56 h-56 flex items-center justify-center">
                      {/* Try rendering as QR image if it's base64, fallback to text */}
                      {qrCode.startsWith('data:') ? (
                        <img src={qrCode} alt="QR Code" className="w-full h-full object-contain" />
                      ) : (
                        <pre className="text-[5px] leading-[5px] font-mono text-black whitespace-pre overflow-hidden" style={{ maxWidth: '100%', maxHeight: '100%' }}>
                          {qrCode}
                        </pre>
                      )}
                    </div>
                  </div>

                  {/* Scan instructions */}
                  <div className="rounded-xl bg-white/5 border border-white/5 p-4">
                    <p className="text-xs font-semibold text-green-400 mb-3 flex items-center gap-1.5">
                      <Smartphone size={12} /> How to scan:
                    </p>
                    <ol className="space-y-2">
                      {SCAN_STEPS.map((step) => (
                        <li key={step.num} className="flex items-start gap-2.5 text-xs text-gray-300">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-[10px] font-bold">
                            {step.num}
                          </span>
                          <span className="mt-0.5">{step.text}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <p className="text-[11px] text-gray-600 text-center">
                    QR code refreshes every 60 seconds. The page updates automatically.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <AlertCircle size={40} className="text-red-400 mb-4" />
                  <p className="text-red-400 font-semibold text-sm">Unable to get QR code</p>
                  <p className="text-xs text-gray-500 mt-2 text-center max-w-xs">
                    The bot server may not be running. Check your VPS status and try again.
                  </p>
                  <button
                    onClick={fetchStatus}
                    className="mt-4 flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 transition-colors"
                  >
                    <RefreshCw size={14} /> Retry
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'link' && (
            <div className="space-y-5">
              {/* Phone number pairing info */}
              <div className="rounded-xl bg-white/5 border border-white/5 p-5">
                <p className="text-sm font-semibold text-white mb-2">Pair with phone number</p>
                <p className="text-xs text-gray-400 mb-4">
                  If you can't scan the QR code, you can pair using your phone number instead.
                  This feature requires the bot server to be running.
                </p>

                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 text-xs text-yellow-400">
                  <ArrowRight size={12} className="inline mr-1" />
                  This will be available once your VPS is deployed and the bot is running.
                </div>
              </div>

              {/* Steps */}
              <div className="rounded-xl bg-white/5 border border-white/5 p-4">
                <p className="text-xs font-semibold text-green-400 mb-3">How it works:</p>
                <ol className="space-y-2">
                  {[
                    'Enter your WhatsApp phone number',
                    'We send you a pairing code',
                    'Enter the code in WhatsApp',
                    'Your bot connects automatically',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span className="mt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Bot Page ──────────────────────────────────────────────────────────────

export default function BotPage() {
  const queryClient = useQueryClient()
  const { data: user } = useQuery({ queryKey: ['user'], queryFn: getCurrentUser })
  const { data: bots, isLoading, refetch } = useQuery({
    queryKey: ['bots', user?.id],
    queryFn: () => getBotInstances(user?.id ?? ''),
    enabled: !!user?.id,
  })

  const [showCreate, setShowCreate] = useState(false)
  const [newBotName, setNewBotName] = useState('')
  const [qrBotId, setQrBotId] = useState<string | null>(null)
  const [qrBotName, setQrBotName] = useState<string>('')

  // Auto-refresh bot list every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => refetch(), 15000)
    return () => clearInterval(interval)
  }, [refetch])

  // Open QR modal after bot creation
  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!user?.id) throw new Error('Not authenticated')
      // Use the edge function — this creates the DB record AND notifies the bot server
      return callCreateInstance(name)
    },
    onSuccess: (result) => {
      // Invalidate bot list
      queryClient.invalidateQueries({ queryKey: ['bots', user?.id] })
      setShowCreate(false)
      setNewBotName('')

      // Auto-open QR modal for the new bot
      if (result.data?.instance_id) {
        setQrBotId(result.data.instance_id)
        setQrBotName(newBotName)
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async ({ botId, userId }: { botId: string; userId: string }) => {
      return deleteBotInstance(botId, userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots', user?.id] })
      // Close QR modal if we're deleting the bot that's showing QR
      if (qrBotId) setQrBotId(null)
    },
  })

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!newBotName.trim()) return
    createMutation.mutate(newBotName)
  }

  // Status badge helper
  const statusConfig = (status: string) => {
    switch (status) {
      case 'connected':
        return { label: 'Connected', cls: 'bg-green-500/10 text-green-400 border-green-500/30' }
      case 'qr_pending':
        return { label: 'Waiting for QR', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' }
      case 'connecting':
        return { label: 'Connecting...', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/30' }
      default:
        return { label: 'Disconnected', cls: 'bg-gray-500/10 text-gray-400 border-gray-500/30' }
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          Loading bots...
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bot Instances</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your WhatsApp bot instances</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 transition-colors"
        >
          <Plus size={16} /> New Bot
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium mb-4">Create New Bot Instance</h3>
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              value={newBotName}
              onChange={(e) => setNewBotName(e.target.value)}
              placeholder="My Support Bot"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          </form>
          {createMutation.error && (
            <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : 'Failed to create bot. Make sure the edge function is deployed.'}
            </div>
          )}
        </div>
      )}

      {/* Bot list */}
      <div className="space-y-3">
        {bots?.data?.length === 0 && !showCreate ? (
          <div className="glass-card p-8 text-center">
            <Bot size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-300">No bots yet</h3>
            <p className="text-sm text-gray-500 mt-1">Create your first bot instance to get started</p>
          </div>
        ) : (
          bots?.data?.map((bot) => {
            const sc = statusConfig(bot.status)
            return (
              <div key={bot.id} className="glass-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-white/5 p-3">
                      <Bot size={24} className="text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">{bot.instance_name}</h3>
                      <p className="text-xs text-gray-500">{bot.phone_number || 'Not linked yet'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs border ${sc.cls}`}>
                      {sc.label}
                    </span>
                    {(bot.status === 'qr_pending' || bot.status === 'connecting') && (
                      <button
                        onClick={() => {
                          setQrBotId(bot.id)
                          setQrBotName(bot.instance_name)
                        }}
                        className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-green-400 transition-colors"
                        title="Show QR Code"
                      >
                        <QrCode size={18} />
                      </button>
                    )}
                    {bot.status === 'connected' && (
                      <button
                        onClick={() => {
                          setQrBotId(bot.id)
                          setQrBotName(bot.instance_name)
                        }}
                        className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-green-400 transition-colors"
                        title="View connection"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (user?.id && confirm(`Delete "${bot.instance_name}"?`)) {
                          deleteMutation.mutate({ botId: bot.id, userId: user.id })
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete bot"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* QR Code Modal */}
      {qrBotId && user?.id && (
        <QRCodeModal
          botId={qrBotId}
          botName={qrBotName}
          userId={user.id}
          onClose={() => setQrBotId(null)}
        />
      )}
    </div>
  )
}
