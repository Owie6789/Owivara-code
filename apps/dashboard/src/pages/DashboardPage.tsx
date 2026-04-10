import { useQuery } from '@tanstack/react-query'
import { getBotInstances, getCurrentUser } from '@owivara/insforge'
import { Bot, Zap, MessageSquare, Shield, AlertCircle } from 'lucide-react'

// ── Stat skeleton ─────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="rounded-xl border border-white/5 bg-white/3 p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 rounded bg-white/10" />
        <div className="flex-1">
          <div className="h-2.5 w-16 rounded bg-white/10 mb-2" />
          <div className="h-5 w-10 rounded bg-white/10" />
        </div>
      </div>
    </div>
  )
}

// ── Bot row skeleton ──────────────────────────────────────────
function BotRowSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 p-3.5 animate-pulse">
      <div>
        <div className="h-3 w-28 rounded bg-white/10 mb-2" />
        <div className="h-2.5 w-20 rounded bg-white/10" />
      </div>
      <div className="h-5 w-16 rounded-full bg-white/10" />
    </div>
  )
}

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
  })

  const {
    data: bots,
    isLoading: botsLoading,
    isError: botsError,
  } = useQuery({
    queryKey: ['bots', user?.id],
    queryFn: () => getBotInstances(user?.id ?? ''),
    enabled: !!user?.id,
  })

  const isLoading = userLoading || botsLoading
  const connectedCount = bots?.data?.filter((b) => b.status === 'connected').length ?? 0
  const totalCount = bots?.data?.length ?? 0

  const username = user?.email ? user.email.split('@')[0] : null

  // Status badge helper
  const statusStyle = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'qr_pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'disconnected':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  return (
    <div className="min-h-full p-6 space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">
            {isLoading ? 'Loading...' : username ? `Welcome back, ${username}` : 'Dashboard'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your WhatsApp bot instances
          </p>
        </div>
        <a
          href="/dashboard/bots"
          className="rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-2 text-sm font-medium text-green-400 hover:bg-green-500/20 transition-colors"
        >
          + Add bot
        </a>
      </div>

      {/* ── Stat cards ── */}
      {/*
        FIX: Added `grid` class explicitly.
        FIX: Replaced raw "..." loading with skeleton components.
        FIX: AI Status now shows actual meaningful state.
      */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => <StatSkeleton key={n} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Bot,          label: 'Total Bots',   value: String(totalCount),     color: 'text-blue-400' },
            { icon: Zap,          label: 'Connected',    value: String(connectedCount), color: 'text-green-400' },
            { icon: MessageSquare,label: 'Messages',     value: '—',                    color: 'text-yellow-400' },
            { icon: Shield,       label: 'AI Status',    value: totalCount > 0 ? 'Active' : 'Setup needed', color: 'text-purple-400' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/5 bg-white/3 p-5 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <stat.icon className={`${stat.color} shrink-0`} size={18} />
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  {/* FIX: text-gray-200 instead of default to ensure visibility on dark bg */}
                  <p className="mt-0.5 text-xl font-semibold text-gray-200">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Bot list ── */}
      <div className="rounded-xl border border-white/5 bg-white/3 backdrop-blur-sm">
        <div className="border-b border-white/5 px-6 py-4">
          <h2 className="text-sm font-semibold text-white">Your Bot Instances</h2>
        </div>

        <div className="p-4 space-y-2.5">
          {/* Loading state */}
          {isLoading && [1, 2, 3].map((n) => <BotRowSkeleton key={n} />)}

          {/* Error state — FIX: was missing completely */}
          {botsError && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <AlertCircle className="shrink-0 text-red-400" size={18} />
              <div>
                <p className="text-sm font-medium text-red-300">Failed to load bots</p>
                <p className="text-xs text-red-500 mt-0.5">Please refresh the page or try again later.</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !botsError && bots?.data?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <Bot className="text-gray-500" size={24} />
              </div>
              {/* FIX: was text-gray-400 which can be near-invisible. Now text-gray-300 */}
              <p className="text-sm font-medium text-gray-300">No bots yet</p>
              <p className="mt-1 text-xs text-gray-600">Go to the Bots page to create your first WhatsApp bot.</p>
              <a
                href="/dashboard/bots"
                className="mt-5 rounded-xl bg-green-500/10 border border-green-500/20 px-5 py-2 text-sm font-medium text-green-400 hover:bg-green-500/20 transition-colors"
              >
                Create your first bot
              </a>
            </div>
          )}

          {/* Bot list */}
          {!isLoading && !botsError && bots?.data?.map((bot) => (
            <div
              key={bot.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3.5 hover:bg-white/8 transition-colors"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-200">
                  {bot.instance_name}
                </p>
                <p className="mt-0.5 text-xs text-gray-600">
                  {bot.phone_number || 'No number linked'}
                </p>
              </div>
              <span
                className={`ml-4 shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusStyle(bot.status)}`}
              >
                {bot.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick actions ── */}
      {!isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { title: 'Add a bot', desc: 'Link a new WhatsApp number', href: '/dashboard/bots', color: 'text-green-400' },
            { title: 'Configure AI', desc: 'Set your Gemini or OpenAI key', href: '/dashboard/settings', color: 'text-purple-400' },
            { title: 'View analytics', desc: 'Track bot performance', href: '/dashboard/analytics', color: 'text-blue-400' },
          ].map((action) => (
            <a
              key={action.title}
              href={action.href}
              className="group rounded-xl border border-white/5 bg-white/3 p-5 hover:bg-white/6 transition-colors"
            >
              <p className={`text-sm font-semibold ${action.color}`}>{action.title}</p>
              <p className="mt-1 text-xs text-gray-600">{action.desc}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
