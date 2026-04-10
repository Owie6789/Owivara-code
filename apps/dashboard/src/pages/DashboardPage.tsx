import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getBotInstances, getCurrentUser } from '@owivara/insforge'
import { Bot, Zap, MessageSquare, Shield } from 'lucide-react'
import { 
  StatCard, 
  StatSkeleton, 
  BotCard, 
  BotRowSkeleton, 
  QuickAction,
  EmptyState,
  ErrorState 
} from '@/components/dashboard/EnhancedComponents'

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
  })

  const {
    data: bots,
    isLoading: botsLoading,
    isError: botsError,
    refetch,
  } = useQuery({
    queryKey: ['bots', user?.id],
    queryFn: () => getBotInstances(user?.id ?? ''),
    enabled: !!user?.id,
  })

  // Auto-refresh bot statuses every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => refetch(), 15000)
    return () => clearInterval(interval)
  }, [refetch])

  const isLoading = userLoading || botsLoading
  const connectedCount = bots?.data?.filter((b) => b.status === 'connected').length ?? 0
  const totalCount = bots?.data?.length ?? 0

  const username = user?.email ? user.email.split('@')[0] : null

  return (
    <div className="min-h-full p-6 space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isLoading ? 'Loading...' : username ? `Welcome back, ${username}` : 'Dashboard'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your WhatsApp bot instances
          </p>
        </div>
        <a
          href="/dashboard/bots"
          className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-2 text-sm font-medium text-green-400 hover:bg-green-500/20 transition-all duration-200 hover:shadow-md hover:shadow-green-500/10"
        >
          + Add Bot
        </a>
      </div>

      {/* ── Stat cards ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => <StatSkeleton key={n} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Bot}
            label="Total Bots"
            value={totalCount}
            color="text-blue-400"
            delay={0}
          />
          <StatCard
            icon={Zap}
            label="Connected"
            value={connectedCount}
            color="text-green-400"
            delay={0.05}
          />
          <StatCard
            icon={MessageSquare}
            label="Active"
            value={connectedCount > 0 ? `${connectedCount} online` : 'None'}
            color="text-yellow-400"
            delay={0.1}
          />
          <StatCard
            icon={Shield}
            label="AI Status"
            value={totalCount > 0 ? 'Active' : 'Setup needed'}
            color="text-purple-400"
            delay={0.15}
          />
        </div>
      )}

      {/* ── Bot list ── */}
      <div className="rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.02] backdrop-blur-sm">
        <div className="border-b border-white/5 px-6 py-4">
          <h2 className="text-sm font-semibold text-white">Your Bot Instances</h2>
        </div>

        <div className="p-4 space-y-2.5">
          {/* Loading state */}
          {isLoading && [1, 2, 3].map((n) => <BotRowSkeleton key={n} />)}

          {/* Error state */}
          {botsError && (
            <ErrorState
              title="Failed to load bots"
              message="Please refresh the page or try again later."
              onRetry={() => refetch()}
            />
          )}

          {/* Empty state */}
          {!isLoading && !botsError && bots?.data?.length === 0 && (
            <EmptyState
              icon={Bot}
              title="No bots yet"
              description="Go to the Bots page to create your first WhatsApp bot."
              actionLabel="Create your first bot"
              actionHref="/dashboard/bots"
            />
          )}

          {/* Bot list */}
          {!isLoading && !botsError && bots?.data?.map((bot) => (
            <BotCard
              key={bot.id}
              name={bot.instance_name}
              phoneNumber={bot.phone_number}
              status={bot.status}
              onClick={() => {/* TODO: Navigate to bot details */}}
            />
          ))}
        </div>
      </div>

      {/* ── Quick actions ── */}
      {!isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <QuickAction
            icon={Bot}
            title="Add a bot"
            description="Link a new WhatsApp number"
            href="/dashboard/bots"
            color="text-green-400"
            delay={0}
          />
          <QuickAction
            icon={Shield}
            title="Configure AI"
            description="Set your Gemini or OpenAI key"
            href="/dashboard/settings"
            color="text-purple-400"
            delay={0.1}
          />
        </div>
      )}
    </div>
  )
}
