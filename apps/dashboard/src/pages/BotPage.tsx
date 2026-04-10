import { useState, FormEvent, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCurrentUser, getBotInstances, createBotInstance, deleteBotInstance, getBotInstance } from '@owivara/insforge'
import { Bot, Plus, Trash2, QrCode, X, RefreshCw, Check } from 'lucide-react'

/** QR Code Modal Component */
function QRCodeModal({ botId, userId, onClose }: { botId: string; userId: string; onClose: () => void }) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQR = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getBotInstance(botId, userId)
      if (result.error) {
        setError(result.error.message)
      } else {
        setQrCode(result.data?.qr_code || null)
        if (!result.data?.qr_code) {
          setError('QR code not available. The bot may already be connected.')
        }
      }
    } catch {
      setError('Failed to fetch QR code')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQR()
    // Poll every 10 seconds for QR updates
    const interval = setInterval(fetchQR, 10000)
    return () => clearInterval(interval)
  }, [botId, userId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0D0E12] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-semibold text-white mb-1">Scan QR Code</h3>
        <p className="text-sm text-gray-400 mb-6">Open WhatsApp → Linked Devices → Link a Device</p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mb-4" />
            <p className="text-sm text-gray-400">Loading QR code...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 text-center mb-4">
              {error}
            </div>
            <button
              onClick={fetchQR}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 transition-colors"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : qrCode ? (
          <div className="flex flex-col items-center">
            <div className="rounded-xl bg-white p-4 mb-4">
              {/* Render QR as text for now — in production use a QR code library */}
              <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                <pre className="text-[6px] leading-[6px] font-mono text-black whitespace-pre overflow-hidden" style={{ maxWidth: '100%', maxHeight: '100%' }}>
                  {qrCode}
                </pre>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">QR code refreshes automatically. Scan within 60 seconds.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Check size={48} className="text-green-400 mb-4" />
            <p className="text-sm text-green-400 font-medium">Bot is connected!</p>
            <p className="text-xs text-gray-500 mt-1">No QR code needed.</p>
          </div>
        )}
      </div>
    </div>
  )
}

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

  // Auto-refresh bot list every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => refetch(), 15000)
    return () => clearInterval(interval)
  }, [refetch])

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!user?.id) throw new Error('Not authenticated')
      return createBotInstance(user.id, { instance_name: name })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots', user?.id] })
      setShowCreate(false)
      setNewBotName('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async ({ botId, userId }: { botId: string; userId: string }) => {
      return deleteBotInstance(botId, userId)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bots', user?.id] }),
  })

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!newBotName.trim()) return
    createMutation.mutate(newBotName)
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
              placeholder="My Bot"
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
          bots?.data?.map((bot) => (
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
                  <span className={`px-2 py-1 rounded-full text-xs border ${
                    bot.status === 'connected' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                    bot.status === 'qr_pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                    'bg-gray-500/10 text-gray-400 border-gray-500/30'
                  }`}>
                    {bot.status === 'connected' ? 'Connected' : bot.status === 'qr_pending' ? 'QR Pending' : 'Disconnected'}
                  </span>
                  {bot.status === 'qr_pending' && (
                    <button
                      onClick={() => setQrBotId(bot.id)}
                      className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-green-400 transition-colors"
                      title="Show QR Code"
                    >
                      <QrCode size={18} />
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
          ))
        )}
      </div>

      {/* QR Code Modal */}
      {qrBotId && user?.id && (
        <QRCodeModal
          botId={qrBotId}
          userId={user.id}
          onClose={() => setQrBotId(null)}
        />
      )}
    </div>
  )
}
