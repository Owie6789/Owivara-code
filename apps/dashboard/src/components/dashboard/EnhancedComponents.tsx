import { type ElementType } from 'react'
import { motion } from 'framer-motion'

// ── Enhanced Stat Card ─────────────────────────────────────────────
interface StatCardProps {
  icon: ElementType
  label: string
  value: string | number
  color: string
  trend?: {
    value: number
    positive: boolean
  }
  delay?: number
}

export function StatCard({ icon: Icon, label, value, color, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="group relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-5 backdrop-blur-sm transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 to-white/[0.02] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg bg-white/5 p-2 transition-colors duration-200 group-hover:bg-white/10`}>
              <Icon className={`${color}`} size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-100 tracking-tight">{value}</p>
            </div>
          </div>
        </div>
        
        {trend && (
          <div className="mt-3 flex items-center gap-1.5">
            <span className={`text-xs font-medium ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-gray-500">vs last week</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Stat Skeleton ─────────────────────────────────────────────
export function StatSkeleton() {
  return (
    <div className="rounded-xl border border-white/5 bg-white/3 p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-white/10" />
        <div className="flex-1">
          <div className="h-2.5 w-16 rounded bg-white/10 mb-2" />
          <div className="h-6 w-12 rounded bg-white/10" />
        </div>
      </div>
    </div>
  )
}

// ── Enhanced Bot Card ──────────────────────────────────────────
interface BotCardProps {
  name: string
  phoneNumber?: string | null
  status: 'connected' | 'qr_pending' | 'disconnected' | string
  onClick?: () => void
}

export function BotCard({ name, phoneNumber, status, onClick }: BotCardProps) {
  const statusConfig = {
    connected: {
      label: 'Connected',
      dotColor: 'bg-green-400',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      borderColor: 'border-green-500/20',
    },
    qr_pending: {
      label: 'QR Pending',
      dotColor: 'bg-yellow-400',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/20',
    },
    disconnected: {
      label: 'Disconnected',
      dotColor: 'bg-red-400',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-400',
      borderColor: 'border-red-500/20',
    },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    dotColor: 'bg-gray-400',
    bgColor: 'bg-gray-500/10',
    textColor: 'text-gray-400',
    borderColor: 'border-gray-500/20',
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01, x: 2 }}
      className="group w-full text-left"
    >
      <div className={`flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-4 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:shadow-md hover:shadow-black/10`}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Status indicator dot */}
          <div className="relative shrink-0">
            <div className={`h-2.5 w-2.5 rounded-full ${config.dotColor}`} />
            {status === 'connected' && (
              <div className={`absolute inset-0 rounded-full ${config.dotColor} animate-ping opacity-75`} />
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
              {name}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {phoneNumber || 'No phone number'}
            </p>
          </div>
        </div>

        <div className={`ml-4 shrink-0 rounded-full border ${config.borderColor} ${config.bgColor} px-3 py-1.5`}>
          <span className={`text-xs font-medium ${config.textColor}`}>
            {config.label}
          </span>
        </div>
      </div>
    </motion.button>
  )
}

// ── Bot Row Skeleton ──────────────────────────────────────────
export function BotRowSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
        <div>
          <div className="h-3 w-28 rounded bg-white/10 mb-2" />
          <div className="h-2.5 w-20 rounded bg-white/10" />
        </div>
      </div>
      <div className="h-6 w-20 rounded-full bg-white/10" />
    </div>
  )
}

// ── Enhanced Quick Action Card ─────────────────────────────────
interface QuickActionProps {
  icon: ElementType
  title: string
  description: string
  href: string
  color: string
  delay?: number
}

export function QuickAction({ icon: Icon, title, description, href, color, delay = 0 }: QuickActionProps) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-5 backdrop-blur-sm transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/20">
        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 to-white/[0.03] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        
        <div className="relative">
          <div className={`mb-3 inline-flex rounded-lg bg-white/5 p-2.5 transition-colors duration-200 group-hover:bg-white/10`}>
            <Icon className={color} size={20} />
          </div>
          <p className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
            {title}
          </p>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
          
          {/* Arrow indicator */}
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-gray-400 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1">
            <span>Learn more</span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </div>
        </div>
      </div>
    </motion.a>
  )
}

// ── Empty State Component ──────────────────────────────────────
interface EmptyStateProps {
  icon: ElementType
  title: string
  description: string
  actionLabel: string
  actionHref: string
  actionColor?: string
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  actionHref,
  actionColor = 'text-green-400'
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
      >
        <Icon className="text-gray-500" size={24} />
      </motion.div>
      <p className="text-sm font-semibold text-gray-300">{title}</p>
      <p className="mt-1 text-xs text-gray-500 max-w-xs">{description}</p>
      <a
        href={actionHref}
        className={`mt-5 rounded-lg border border-green-500/20 bg-green-500/10 px-5 py-2 text-sm font-medium ${actionColor} hover:bg-green-500/20 transition-all duration-200 hover:shadow-md hover:shadow-green-500/10`}
      >
        {actionLabel}
      </a>
    </motion.div>
  )
}

// ── Error State Component ──────────────────────────────────────
interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({ 
  title = 'Failed to load', 
  message = 'Please refresh the page or try again later.',
  onRetry 
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4"
    >
      <div className="shrink-0">
        <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-300">{title}</p>
        <p className="text-xs text-red-400/80 mt-0.5">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 rounded-md bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/30 transition-colors"
        >
          Retry
        </button>
      )}
    </motion.div>
  )
}
