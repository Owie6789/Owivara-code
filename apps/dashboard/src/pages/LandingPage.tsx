import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import GradualBlur from '../components/ui/GradualBlur'

// ─── Iconsax SVG Icon Components ────────────────────────────────────────────
const IconsaxIcon = ({
  icon,
  className = '',
}: {
  icon: string
  className?: string
}) => {
  const icons: Record<string, React.ReactNode> = {
    message: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 12.5H8.51M12 12.5H12.01M15.5 12.5H15.51M2 8.5C2 4.91015 4.91015 2 8.5 2H15.5C19.0899 2 22 4.91015 22 8.5V15.5C22 19.0899 19.0899 22 15.5 22H13C11.5858 22 10.2297 21.548 9.1083 20.7206L4.33452 21.784C3.53459 21.9623 2.80459 21.2323 2.98287 20.4324L3.55697 17.8484C2.56325 16.5581 2 14.9458 2 13.2049V8.5Z" />
      </svg>
    ),
    bot: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2V6M8 6H16C17.1046 6 18 6.89543 18 8V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V8C6 6.89543 6.89543 6 8 6ZM9.5 12H9.51M14.5 12H14.51M5 10H3C2.44772 10 2 10.4477 2 11V15C2 15.5523 2.44772 16 3 16H5M19 10H21C21.5523 10 22 10.4477 22 11V15C22 15.5523 21.5523 16 21 16H19" />
      </svg>
    ),
    zap: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L4.5 12.5H11L10 22L19.5 11.5H12.5L13 2Z" />
      </svg>
    ),
    shield: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3L4.5 6.5V11C4.5 15.5 7.5 19.5 12 21C16.5 19.5 19.5 15.5 19.5 11V6.5L12 3Z" />
      </svg>
    ),
    'arrow-right': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12H20M20 12L14 6M20 12L14 18" />
      </svg>
    ),
    'check': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17L4 12" />
      </svg>
    ),
    'grid': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    users: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8.5C16 10.433 14.433 12 12.5 12C10.567 12 9 10.433 9 8.5C9 6.567 10.567 5 12.5 5C14.433 5 16 6.567 16 8.5ZM5 18C5 15.7909 6.79086 14 9 14H16C18.2091 14 20 15.7909 20 18V19C20 19.5523 19.5523 20 19 20H6C5.44772 20 5 19.5523 5 19V18Z" />
      </svg>
    ),
    quote: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21C3 21 4 16 4 12C4 8 7 6 10 6C10 6 8 9 8 11C8 13 9.5 14 11 14C12.5 14 14 12.5 14 11C14 9.5 12 6 9 6M14 21C14 21 15 16 15 12C15 8 18 6 21 6C21 6 19 9 19 11C19 13 20.5 14 22 14" />
      </svg>
    ),
    sparkles: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2ZM19 15L19.75 17.25L22 18L19.75 18.75L19 21L18.25 18.75L16 18L18.25 17.25L19 15Z" />
      </svg>
    ),
    activity: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12H6L9 5L13 19L16 12H21" />
      </svg>
    ),
    'message-square': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 12.5H8.51M12 12.5H12.01M15.5 12.5H15.51M2 8.5C2 4.91015 4.91015 2 8.5 2H15.5C19.0899 2 22 4.91015 22 8.5V15.5C22 19.0899 19.0899 22 15.5 22H13C11.5858 22 10.2297 21.548 9.1083 20.7206L4.33452 21.784C3.53459 21.9623 2.80459 21.2323 2.98287 20.4324L3.55697 17.8484C2.56325 16.5581 2 14.9458 2 13.2049V8.5Z" />
      </svg>
    ),
    'document-text': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V7.5L14.5 2Z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
      </svg>
    ),
    'global': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2C14.5 4.5 16 8 16 12C16 16 14.5 19.5 12 22C9.5 19.5 8 16 8 12C8 8 9.5 4.5 12 2Z" />
      </svg>
    ),
    'image': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21,15 16,10 5,21" />
      </svg>
    ),
  }
  return <span className={`inline-flex items-center justify-center ${className}`}>{icons[icon] || null}</span>
}

// ─── Floating App Icon (for hero rotator) ─────────────────────────────────────
const heroIcons = [
  { name: 'Owivara', color: '#22c55e' },
  { name: 'Bot', color: '#3b82f6' },
  { name: 'AI', color: '#8b5cf6' },
  { name: 'Chat', color: '#f59e0b' },
  { name: 'Data', color: '#ef4444' },
  { name: 'Cloud', color: '#06b6d4' },
]

function HeroIconRotator() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsExiting(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % heroIcons.length)
        setIsExiting(false)
      }, 300)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const icon = heroIcons[currentIndex]

  return (
    <div className="w-20 h-20 mb-8 relative">
      <motion.div
        className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${isExiting ? 'opacity-0 scale-75 rotate-8' : 'opacity-100 scale-100 rotate-0'}`}
        style={{ backgroundColor: icon.color }}
        transition={{ duration: 0.3 }}
      >
        <IconsaxIcon icon="bot" className="text-white w-10 h-10" />
      </motion.div>
    </div>
  )
}

// ─── Scroll-reveal Section ────────────────────────────────────────────────────
const Section = React.forwardRef<HTMLElement, { children: React.ReactNode; className?: string; id?: string }>(
  ({ children, className = '', id }, ref) => {
    const [viewRef, inView] = useInView({ threshold: 0.12, triggerOnce: true, rootMargin: '0px 0px -40px 0px' })
    const setRefs = (node: HTMLElement | null) => {
      viewRef(node)
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }
    return (
      <motion.section
        id={id}
        ref={setRefs}
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={className}
      >
        {children}
      </motion.section>
    )
  }
)

// ─── Floating Icon with Physics ───────────────────────────────────────────────
function FloatingIcon({ color, size, initialX, initialY }: { color: string; size: string; initialX: number; initialY: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: initialX, y: initialY })
  const velRef = useRef({ x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.5 })

  useEffect(() => {
    if (!containerRef.current?.parentElement) return
    const container = containerRef.current.parentElement
    let animFrame: number

    const animate = () => {
      const rect = container.getBoundingClientRect()
      const iconSize = parseFloat(size) || 64
      const maxX = rect.width - iconSize
      const maxY = rect.height - iconSize

      let { x, y } = posRef.current
      let { x: vx, y: vy } = velRef.current

      // Add slight randomness
      vx += (Math.random() - 0.5) * 0.02
      vy += (Math.random() - 0.5) * 0.02

      // Damping
      vx *= 0.999
      vy *= 0.999

      x += vx
      y += vy

      // Bounce off walls
      if (x <= 0 || x >= maxX) { vx = -vx; x = Math.max(0, Math.min(x, maxX)) }
      if (y <= 0 || y >= maxY) { vy = -vy; y = Math.max(0, Math.min(y, maxY)) }

      posRef.current = { x, y }
      velRef.current = { x: vx, y: vy }

      if (containerRef.current) {
        containerRef.current.style.transform = `translate(${x}px, ${y}px)`
      }

      animFrame = requestAnimationFrame(animate)
    }

    animFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrame)
  }, [size])

  return (
    <div
      ref={containerRef}
      className={`floating-icon absolute ${size} rounded-[22%] shadow-md`}
      style={{
        backgroundColor: color,
        left: 0,
        top: 0,
        opacity: 0,
        transform: 'scale(0.6)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    />
  )
}

// ─── Scroll-Jacked Stats Container — pins and reveals stats on scroll ────────
function ScrollJackedStats() {
  const containerRef = useRef<HTMLDivElement>(null)
  const iconsRef = useRef<HTMLDivElement>(null)

  // Use Framer Motion's built-in useScroll for reliable container-relative scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Floating icons entry animation
  useEffect(() => {
    if (!iconsRef.current) return
    const icons = iconsRef.current.querySelectorAll('.floating-icon')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            icons.forEach((icon, i) => {
              setTimeout(() => {
                ;(icon as HTMLElement).style.opacity = '1'
                ;(icon as HTMLElement).style.transform = 'scale(1)'
              }, i * 80)
            })
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )
    observer.observe(iconsRef.current)
    return () => observer.disconnect()
  }, [])

  // STAT TRANSITIONS — Each stat visible for ~40% of scroll range with 5% crossfade zones
  // scrollYProgress goes from 0 (top of container enters viewport) to 1 (bottom of container leaves viewport)

  // Stat 0: Bots (0% → 35%)
  const stat0Opacity = useTransform(scrollYProgress, [0, 0.02, 0.30, 0.35], [0, 1, 1, 0])
  const stat0Y = useTransform(scrollYProgress, [0, 0.02, 0.30, 0.35], [30, 0, 0, -30])
  const stat0Scale = useTransform(scrollYProgress, [0, 0.02, 0.30, 0.35], [0.94, 1, 1, 0.94])

  // Stat 1: Messages (32% → 67%)
  const stat1Opacity = useTransform(scrollYProgress, [0.32, 0.37, 0.62, 0.67], [0, 1, 1, 0])
  const stat1Y = useTransform(scrollYProgress, [0.32, 0.37, 0.62, 0.67], [30, 0, 0, -30])
  const stat1Scale = useTransform(scrollYProgress, [0.32, 0.37, 0.62, 0.67], [0.94, 1, 1, 0.94])

  // Stat 2: Businesses (64% → 100%)
  const stat2Opacity = useTransform(scrollYProgress, [0.64, 0.69, 0.98, 1], [0, 1, 1, 1])
  const stat2Y = useTransform(scrollYProgress, [0.64, 0.69, 0.98, 1], [30, 0, 0, 0])
  const stat2Scale = useTransform(scrollYProgress, [0.64, 0.69, 0.98, 1], [0.94, 1, 1, 1])

  // Progress dots — active when corresponding stat is centered
  const dot0Scale = useTransform(scrollYProgress, [0, 0.15, 0.35], [0.8, 1.5, 0.8])
  const dot0Color = useTransform(scrollYProgress, [0, 0.15, 0.35], ['#d1d5db', '#0a0a0a', '#d1d5db'])

  const dot1Scale = useTransform(scrollYProgress, [0.32, 0.50, 0.67], [0.8, 1.5, 0.8])
  const dot1Color = useTransform(scrollYProgress, [0.32, 0.50, 0.67], ['#d1d5db', '#0a0a0a', '#d1d5db'])

  const dot2Scale = useTransform(scrollYProgress, [0.64, 0.82, 1], [0.8, 1.5, 0.8])
  const dot2Color = useTransform(scrollYProgress, [0.64, 0.82, 1], ['#d1d5db', '#0a0a0a', '#d1d5db'])

  return (
    // 250vh gives ~2.5 screens of scroll distance for smooth stat transitions
    <div ref={containerRef} style={{ height: '250vh', position: 'relative' }}>
      {/* Sticky container — pins in place while scrolling through parent */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center bg-white">
        {/* Floating icons background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" ref={iconsRef}>
          {[
            { color: '#22c55e', size: 'w-[72px] h-[72px]', x: 60, y: 80 },
            { color: '#3b82f6', size: 'w-[56px] h-[56px]', x: 280, y: 140 },
            { color: '#8b5cf6', size: 'w-[80px] h-[80px]', x: 520, y: 60 },
            { color: '#f59e0b', size: 'w-[64px] h-[64px]', x: 120, y: 380 },
            { color: '#ef4444', size: 'w-[88px] h-[88px]', x: 680, y: 280 },
            { color: '#06b6d4', size: 'w-[60px] h-[60px]', x: 200, y: 500 },
            { color: '#22c55e', size: 'w-[76px] h-[76px]', x: 580, y: 420 },
            { color: '#3b82f6', size: 'w-[48px] h-[48px]', x: 420, y: 200 },
          ].map((icon, i) => (
            <FloatingIcon
              key={i}
              color={icon.color}
              size={icon.size}
              initialX={icon.x}
              initialY={icon.y}
            />
          ))}
        </div>

        {/* Content layer — stats that crossfade */}
        <div className="relative z-10 text-center px-6 w-full max-w-4xl mx-auto">
          <p className="text-sm font-medium text-gray-400 mb-12">A growing library of</p>

          {/* Stats container — fixed height prevents layout shift */}
          <div className="relative w-full mx-auto" style={{ height: '280px' }}>
            {/* Stat 0: Bots */}
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ opacity: stat0Opacity, y: stat0Y, scale: stat0Scale, willChange: 'transform, opacity' }}
            >
              <p className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-[#0a0a0a] tracking-[-0.04em] leading-none tabular-nums">
                2,400+
              </p>
              <p className="mt-5 text-base md:text-lg text-gray-500 font-medium">bots live and running</p>
            </motion.div>

            {/* Stat 1: Messages */}
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ opacity: stat1Opacity, y: stat1Y, scale: stat1Scale, willChange: 'transform, opacity' }}
            >
              <p className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-[#0a0a0a] tracking-[-0.04em] leading-none tabular-nums">
                1.2M+
              </p>
              <p className="mt-5 text-base md:text-lg text-gray-500 font-medium">messages handled</p>
            </motion.div>

            {/* Stat 2: Businesses */}
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ opacity: stat2Opacity, y: stat2Y, scale: stat2Scale, willChange: 'transform, opacity' }}
            >
              <p className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-[#0a0a0a] tracking-[-0.04em] leading-none tabular-nums">
                11,400+
              </p>
              <p className="mt-5 text-base md:text-lg text-gray-500 font-medium">businesses using Owivara</p>
            </motion.div>
          </div>

          {/* Progress dots */}
          <div className="flex gap-3 justify-center mt-14">
            <motion.div className="w-2.5 h-2.5 rounded-full transition-colors duration-300" style={{ backgroundColor: dot0Color, scale: dot0Scale }} />
            <motion.div className="w-2.5 h-2.5 rounded-full transition-colors duration-300" style={{ backgroundColor: dot1Color, scale: dot1Scale }} />
            <motion.div className="w-2.5 h-2.5 rounded-full transition-colors duration-300" style={{ backgroundColor: dot2Color, scale: dot2Scale }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Data ────────────────────────────────────────────────────────────────────
const features = [
  { icon: 'bot', title: 'Multi-bot management', description: 'Run separate WhatsApp numbers for support, sales, and ops — all under one login.', tab: 'Setup' },
  { icon: 'message-square', title: 'Live message console', description: 'See every conversation happening across all your bots in real-time.', tab: 'Monitoring' },
  { icon: 'zap', title: 'Bring your own AI key', description: 'Connect your Gemini or OpenAI API key once. Owivara uses it for every response.', tab: 'AI' },
  { icon: 'shield', title: 'Row-level data isolation', description: 'Your bot data is isolated at the database level by Postgres RLS.', tab: 'Setup' },
  { icon: 'sparkles', title: 'Configurable AI persona', description: 'Set name, tone, language, and boundaries for your bot personality.', tab: 'AI' },
  { icon: 'activity', title: 'Message volume analytics', description: 'See daily volume, peak hours, response rate, and drop-off points.', tab: 'Monitoring' },
  { icon: 'document-text', title: 'Auto-response workflows', description: 'Create rule-based flows that handle common queries without AI.', tab: 'Setup' },
  { icon: 'users', title: 'Team collaboration', description: 'Invite team members with role-based access to bots and conversations.', tab: 'Setup' },
  { icon: 'global', title: 'Multi-language AI', description: 'Your bot speaks your customer\'s language — English, Pidgin, Yoruba, Igbo, Hausa.', tab: 'AI' },
  { icon: 'image', title: 'Media support', description: 'Send and receive images, documents, voice notes, and location data.', tab: 'Monitoring' },
  // New: Group Management features
  { icon: 'people', title: 'Group admin tools', description: 'Kick, promote, demote, mute groups, change group name/description, and manage members.', tab: 'Commands' },
  { icon: 'shield-security', title: 'Anti-spam & anti-link', description: 'Auto-kick spammers, block external links, anti-fake, and anti-promote/demote protection.', tab: 'Commands' },
  { icon: 'calendar', title: 'Scheduled messages', description: 'Schedule messages to send at specific times. Supports recurring and one-time schedules.', tab: 'Commands' },
  { icon: 'filter', title: 'Auto-filter & moderation', description: 'Auto-delete harmful words, anti-bot detection, and custom filter rules for your groups.', tab: 'Commands' },
  { icon: 'download', title: 'Social media downloader', description: 'Download from Instagram, TikTok, Facebook, YouTube, Pinterest, and Twitter with one command.', tab: 'Media' },
  { icon: 'music', title: 'YouTube music & video', description: 'Search and download songs, videos, or playlists directly from YouTube via chat.', tab: 'Media' },
  { icon: 'sticker', title: 'Sticker maker & converters', description: 'Turn images, GIFs, and videos into stickers. Convert between formats (MP3, MP4, photo, doc).', tab: 'Media' },
  { icon: 'edit-2', title: 'Media editing tools', description: 'Trim, rotate, flip, slow-mo, circle crop, and add audio to images with built-in commands.', tab: 'Media' },
]

const plans = [
  {
    name: 'Starter',
    price: '₦0',
    period: 'forever',
    description: 'For individuals getting their first bot running.',
    features: ['1 bot instance', '2,000 messages per month', 'Basic message console', 'Community support (Discord)'],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '₦15,000',
    period: 'per month',
    description: 'For teams running WhatsApp as a real business channel.',
    features: ['10 bot instances', '100,000 messages per month', 'BYOK — Gemini & OpenAI', 'Live message console', 'Persona editor', '3 team seats included', 'Email support (< 24h response)'],
    cta: 'Start Pro trial',
    highlighted: true,
  },
  {
    name: 'Scale',
    price: '₦45,000',
    period: 'per month',
    description: 'For operations where WhatsApp IS the product.',
    features: ['Unlimited bot instances', 'Unlimited messages', 'BYOK + custom model endpoints', 'Priority support + SLA', 'Custom analytics exports', 'Unlimited team seats', 'Dedicated onboarding call'],
    cta: 'Contact sales',
    highlighted: false,
  },
]

const testimonials = [
  { name: 'Adebayo Ogunlesi', role: 'CTO, TechBro Lagos', text: "We were managing support for 3 products across 3 different WhatsApp numbers. Owivara gave us one dashboard in an afternoon." },
  { name: 'Chioma Nwosu', role: 'Founder, NaijaMart', text: "The RLS explanation on the pricing page is what convinced me. My customers' data is mine, not a training dataset." },
  { name: 'Emeka Okafor', role: 'Solo developer', text: "I was paying ₦40k to another platform per client just for AI. Switched to Owivara BYOK — now I pay Google directly at about ₦3,000/month." },
  { name: 'Fatima Abdullahi', role: 'Head of Product, PayHub', text: "Our compliance team had questions about where customer messages were stored. We could answer every single one." },
  { name: 'Tunde Bakare', role: 'CEO, QuickServe', text: "Owivara's AI handled 78% of our 10,000 conversations with zero escalation. We hired one person instead of eight." },
  { name: 'Ngozi Eze', role: 'Lead Engineer, AppNation', text: "Owivara is the first WhatsApp API provider where the QR reconnection actually works reliably." },
]

const trustedLogos = ['Flutterwave', 'Paystack', 'Andela', 'Interswitch', 'MTN', 'Airtel', 'Glo', 'Opay', 'Moniepoint', 'Kuda']

// ─── Feature marquee items (replaces tech stack logos) ─────────
// Each feature has: name, an inline SVG icon, and a dark monochrome palette
const featureMarqueeItems = [
  {
    name: 'View-Once',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    name: 'Auto-Download',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: 'AI Chatbot',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8.5" cy="10" r="1" fill="currentColor" />
        <circle cx="12" cy="10" r="1" fill="currentColor" />
        <circle cx="15.5" cy="10" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'Group Admin',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: 'Media Tools',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: 'Stickers',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="10" r="1" fill="currentColor" />
        <path d="M8.5 15c1 1 2.5 1.5 3.5 1.5s2.5-.5 3.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Scheduler',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 14v3l2 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: 'Anti-Link',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Auto-Reply',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Social DL',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18" cy="6" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'Warn System',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="17" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'PDF Maker',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 15h6M9 11h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Fancy Text',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <path d="M4 7V4h16v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 4v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 20h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

// ─── Dark glossy badge style ───────────────────────────────────
// Each badge uses a dark monochrome palette with a glossy highlight
// on the top-left edge for a premium 3D pill effect.
const badgeBaseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  borderRadius: '9999px',
  whiteSpace: 'nowrap',
  // Dark glossy gradient: brighter top-left, darker bottom-right
  background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #111111 100%)',
  // Subtle glossy highlight on top-left edge
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.06)',
  color: '#a3a3a3',
  fontSize: '13px',
  fontWeight: 500,
  letterSpacing: '-0.01em',
}

// Subtle color tints per feature for the icon
const iconTints: Record<number, string> = {
  0: '#6ee7b7', // View-Once — green tint
  1: '#93c5fd', // Auto-Download — blue tint
  2: '#c4b5fd', // AI Chatbot — purple tint
  3: '#fbbf24', // Group Admin — amber tint
  4: '#f87171', // Media Tools — red tint
  5: '#34d399', // Stickers — emerald tint
  6: '#60a5fa', // Scheduler — sky tint
  7: '#fb923c', // Anti-Link — orange tint
  8: '#a78bfa', // Auto-Reply — violet tint
  9: '#f472b6', // Social DL — pink tint
  10: '#ef4444', // Warn System — red tint
  11: '#22d3ee', // PDF Maker — cyan tint
  12: '#e879f9', // Fancy Text — fuchsia tint
}

// ════════════════════════════════════════════════════════════════
// MAIN LANDING PAGE — MOBBIN STYLE
// ════════════════════════════════════════════════════════════════
export default function LandingPage() {
  const [tab, setTab] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const tabs = ['All', 'Setup', 'AI', 'Monitoring', 'Commands', 'Media']
  const featuresRef = useRef<HTMLElement>(null)

  // Centralized scroll helper — accounts for sticky nav offset
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (!element) return
    const navHeight = 100
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.scrollY - navHeight
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
    setMobileMenuOpen(false)
  }, [])

  // Scroll detection for navbar expand
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const filteredFeatures =
    tab === 0 ? features :
    tab === 1 ? features.filter(f => f.tab === 'Setup') :
    tab === 2 ? features.filter(f => f.tab === 'AI') :
    tab === 3 ? features.filter(f => f.tab === 'Monitoring') :
    tab === 4 ? features.filter(f => f.tab === 'Commands') :
    features.filter(f => f.tab === 'Media')

  return (
    <>
      <SEOHead
        title="Owivara — WhatsApp Bot Control Panel for Africa"
        description="The freemium WhatsApp bot platform for Nigeria and Africa. Build AI-powered bots without coding. Private, secure, and fast."
        path="/"
      />

      {/* ══ NAV — Fixed standalone element with proper pointer events ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-[9999] flex justify-center" style={{ paddingTop: '14px', paddingLeft: '1rem', paddingRight: '1rem' }}>
          {/* The actual pill — self-contained interactive element */}
          <div
            className="relative flex items-center rounded-full pointer-events-auto"
            style={{
              maxWidth: scrolled ? '640px' : '560px',
              minHeight: '60px',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              background: 'rgba(255, 255, 255, 0.85)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.08)',
              transition: 'max-width 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
            }}
          >
            <div className="flex items-center w-full" style={{ minHeight: '60px', paddingLeft: '32px', paddingRight: '32px' }}>
              {/* Logo — aligned baseline with nav items */}
              <Link to="/" className="flex items-center gap-2.5 shrink-0 mr-6 group pointer-events-auto" aria-label="Owivara home">
                <div className="w-8 h-8 rounded-lg overflow-hidden transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
                  <img src="/logo.svg" alt="Owivara" className="w-full h-full object-cover" />
                </div>
                <span className="text-[17px] font-bold tracking-[-0.02em] text-[#0a0a0a] leading-none whitespace-nowrap">Owivara</span>
              </Link>

              {/* Nav Links — same baseline as logo text */}
              <div className="hidden md:flex items-center gap-7 shrink-0 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => scrollToSection('features')}
                  className="text-[14px] font-semibold text-gray-500 hover:text-[#0a0a0a] transition-colors whitespace-nowrap cursor-pointer bg-transparent border-none p-0"
                >
                  Features
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('pricing')}
                  className="text-[14px] font-semibold text-gray-500 hover:text-[#0a0a0a] transition-colors whitespace-nowrap cursor-pointer bg-transparent border-none p-0"
                >
                  Pricing
                </button>
              </div>

              {/* Spacer between nav links and right actions */}
              <div className="hidden md:block w-8 shrink-0" />

              {/* Right Actions — same baseline */}
              <div className="hidden md:flex items-center gap-3 shrink-0 pointer-events-auto">
                <Link to="/login" className="text-[14px] font-semibold text-gray-500 hover:text-[#0a0a0a] transition-colors whitespace-nowrap pointer-events-auto" style={{ textDecoration: 'none' }}>
                  Log in
                </Link>

                {/* Join for free — container hides before scroll, button slides in with slight delay */}
                <div
                  style={{
                    overflow: 'hidden',
                    maxWidth: scrolled ? '160px' : '0px',
                    transition: 'max-width 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
                  }}
                >
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center rounded-full bg-[#0a0a0a] text-[14px] font-semibold text-white whitespace-nowrap hover:bg-[#1a1a1a] active:scale-95 pointer-events-auto"
                    style={{
                      padding: '10px 22px',
                      letterSpacing: '-0.01em',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                      opacity: scrolled ? 1 : 0,
                      transform: scrolled ? 'translateX(0)' : 'translateX(-12px)',
                      transition: 'opacity 0.3s ease 0.1s, transform 0.4s cubic-bezier(0.32, 0.72, 0, 1) 0.08s',
                    }}
                  >
                    Join for free
                  </Link>
                </div>
              </div>

              {/* Hamburger (mobile only) */}
              <button
                className="flex md:hidden items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100/60 hover:text-gray-700 active:scale-95 transition-all duration-150 ml-auto pointer-events-auto"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                type="button"
              >
                {mobileMenuOpen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6L18 18" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6H20M4 12H20M4 18H20" /></svg>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile dropdown — always mounted, CSS toggle */}
        <div
          className="fixed left-4 right-4 z-[10000] md:hidden"
          style={{
            top: '84px',
            opacity: mobileMenuOpen ? 1 : 0,
            transform: mobileMenuOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)',
            pointerEvents: mobileMenuOpen ? 'auto' : 'none',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          }}
        >
          <div className="rounded-2xl border border-gray-200/80 bg-white/96 backdrop-blur-xl px-5 pb-5 pt-3 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => scrollToSection('features')}
                className="rounded-xl px-4 py-3 text-[15px] font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors text-left w-full bg-transparent border-none cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="rounded-xl px-4 py-3 text-[15px] font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors text-left w-full bg-transparent border-none cursor-pointer"
              >
                Pricing
              </button>
              <div className="mt-2 flex flex-col gap-2 border-t border-gray-100 pt-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-center text-[15px] font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-[#0a0a0a] px-4 py-3 text-center text-[15px] font-semibold text-white hover:bg-[#1a1a1a] active:bg-[#2a2a2a] transition-colors"
                >
                  Join for free
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main content wrapper — contains all scrollable content */}
        <div className="min-h-screen w-full bg-white font-sans text-[#0a0a0a]">

        {/* ══ HERO ══════════════════════════════════════════ */}
        <div className="flex flex-col items-center text-center px-6 pt-40 pb-20 md:px-12 lg:px-24">
          <HeroIconRotator />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-[760px] text-5xl font-extrabold leading-[1.04] tracking-[-0.04em] md:text-7xl"
          >
            The command centre for your <span className="bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">WhatsApp bots.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 max-w-[440px] text-lg leading-relaxed text-gray-500"
          >
            Build, manage, and scale AI-powered WhatsApp bots. Private-first. Built for Africa.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link to="/signup" className="inline-flex items-center justify-center rounded-full bg-[#0a0a0a] px-6 py-3 text-[15px] font-semibold text-white transition-all duration-150 hover:bg-[#1a1a1a] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] active:translate-y-0 active:scale-[0.98] whitespace-nowrap">
              Join for free
            </Link>
            <button
              onClick={() => scrollToSection('pricing')}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-5 py-3 text-[15px] font-semibold text-[#0a0a0a] transition-all duration-150 hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-[0.98] whitespace-nowrap"
            >
              See our plans
              <IconsaxIcon icon="arrow-right" className="text-gray-500" />
            </button>
          </motion.div>
        </div>

        {/* ══ TRUSTED BY LOGOS ═════════════════════════════ */}
        <div className="px-6 pb-20 text-center md:px-12 lg:px-24">
          <p className="text-[13px] font-medium tracking-wider text-gray-400 mb-7">Trusted by teams building for Africa</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
            {trustedLogos.map((logo) => (
              <span key={logo} className="text-[15px] font-semibold text-gray-400 transition-all duration-250 hover:text-gray-900 hover:scale-105 cursor-default">
                {logo}
              </span>
            ))}
          </div>
        </div>

        {/* ══ DASHBOARD PREVIEW ════════════════════════════ */}
        <Section className="px-6 pb-24 md:px-12 lg:px-24">
          <div className="mx-auto max-w-[1200px] bg-gray-100 rounded-[32px] p-8 pb-0 overflow-hidden">
            <div className="bg-white rounded-t-2xl overflow-hidden shadow-[0_-4px_0_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.05)]">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-200 bg-gray-50">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                <div className="flex-1 max-w-[320px] mx-auto bg-gray-200 rounded-full px-3.5 py-1 text-[12px] text-gray-500 text-center">
                  app.owivara.pxxl.click/dashboard
                </div>
              </div>
              {/* Simulated Dashboard */}
              <div className="p-6 bg-[#0B0C10] min-h-[400px]">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {['Total Bots', 'Connected', 'Messages', 'AI Status'].map((label, i) => (
                    <div key={label} className="rounded-xl border border-white/5 bg-white/5 p-4">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="mt-1 text-xl font-semibold text-gray-200">{['3', '2', '1.2M', 'Active'][i]}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white mb-3">Recent Bots</p>
                  {[
                    { name: 'NaijaMart Support', status: 'connected' },
                    { name: 'QuickServe Bot', status: 'connected' },
                    { name: 'TechBro Sales', status: 'qr_pending' },
                  ].map((bot) => (
                    <div key={bot.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-sm text-gray-300">{bot.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        bot.status === 'connected' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>{bot.status.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ══ FEATURE TABS — Horizontal Screenshot Scroll ═══ */}
        <Section id="features" ref={featuresRef} className="px-6 py-24 md:px-12 lg:px-24 text-center">
          <div className="mx-auto max-w-[700px]">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.08] tracking-[-0.035em] text-[#0a0a0a]">
              Some of Owivara's features
            </h2>
          </div>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-1 bg-gray-100 rounded-full p-1">
              {tabs.map((t, idx) => (
                <button
                  key={t}
                  onClick={() => setTab(idx)}
                  className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ease-out whitespace-nowrap ${
                    tab === idx ? 'bg-white text-[#0a0a0a] shadow-sm' : 'text-gray-500 hover:text-[#0a0a0a]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-12">
            {/* Feature cards marquee — infinite horizontal loop left→right with edge fade */}
            <div className="relative overflow-hidden" key={tab}>
              {/* Left edge fade */}
              <div className="absolute inset-y-0 left-0 w-32 md:w-48 z-10 pointer-events-none bg-gradient-to-r from-white via-white/90 to-transparent" />
              {/* Right edge fade */}
              <div className="absolute inset-y-0 right-0 w-32 md:w-48 z-10 pointer-events-none bg-gradient-to-l from-white via-white/90 to-transparent" />

              {/* Marquee track — left to right direction */}
              <motion.div
                key={tab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex gap-5"
                style={{
                  width: 'max-content',
                  animation: 'marquee-scroll-ltr 60s linear infinite',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = 'paused')}
                onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = 'running')}
              >
                {/* Triplicate for seamless loop (left→right: start at -33.33%, animate to 0) */}
                {[...filteredFeatures, ...filteredFeatures, ...filteredFeatures].map((f, i) => (
                  <motion.div
                    key={`${f.title}-${i}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: (i % filteredFeatures.length) * 0.05, ease: 'easeOut' }}
                    className="w-72 flex-shrink-0 rounded-2xl bg-gray-100 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-250 cursor-pointer"
                  >
                    <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center p-6">
                      <IconsaxIcon icon={f.icon} className="text-gray-400 w-16 h-16" />
                    </div>
                    <div className="p-5 text-center">
                      <h3 className="text-[17px] font-bold tracking-[-0.02em] text-[#0a0a0a]">{f.title}</h3>
                      <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </Section>

        {/* ══ STATS — Scroll-Jacked Reveal + Floating Icons ═══ */}
        {/* NOTE: NOT wrapped in <Section> — motion.section + overflow-hidden breaks position:sticky */}
        <div id="stats" className="relative" style={{ overflow: 'visible' }}>
          <ScrollJackedStats />
        </div>

        {/* ══ PRICING ══════════════════════════════════════ */}
        <Section id="pricing" className="px-6 py-24 md:px-12 lg:px-24">
          <div className="mx-auto max-w-[700px] text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.08] tracking-[-0.035em] text-[#0a0a0a]">
              Pricing that makes sense in naira and in logic.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3 items-start">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-8 flex flex-col gap-4 transition-all duration-250 hover:shadow-lg hover:-translate-y-1 ${
                  plan.highlighted ? 'border-2 border-green-500 bg-white shadow-lg' : 'border border-gray-200 bg-white'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-b-lg bg-green-500 px-4 py-1 text-xs font-bold text-white whitespace-nowrap">
                    Most popular
                  </div>
                )}
                <div className={plan.highlighted ? 'pt-2' : ''}>
                  <p className="text-sm font-semibold text-gray-500">{plan.name}</p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#0a0a0a]">{plan.price}</span>
                    <span className="text-sm text-gray-500">/{plan.period}</span>
                  </div>
                  <p className="mt-3 text-sm text-gray-500">{plan.description}</p>
                </div>
                <ul className="flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <IconsaxIcon icon="check" className="text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full rounded-xl py-3 text-sm font-semibold text-center whitespace-nowrap cursor-pointer transition-all duration-150 ${
                  plan.highlighted
                    ? 'bg-[#0a0a0a] text-white border-none hover:bg-[#1a1a1a] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)]'
                    : 'bg-white text-[#0a0a0a] border border-gray-200 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-sm'
                }`}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ══ TESTIMONIALS ═════════════════════════════════ */}
        <Section id="testimonials" className="bg-gray-50 px-6 py-24 md:px-12 lg:px-24">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.08] tracking-[-0.035em] text-[#0a0a0a]">
              What teams said after their first month live.
            </h2>
          </div>
          <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="mb-6 break-inside-avoid rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4"><IconsaxIcon icon="quote" className="text-gray-300" /></div>
                <p className="mb-5 text-sm leading-relaxed text-gray-600">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#0a0a0a]">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ══ CTA SECTION — More Breathing Room ════════════ */}
        <section className="bg-[#0a0a0a] text-white py-24 md:py-32">
          <div className="px-6 md:px-12 lg:px-24 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold leading-[1.1] tracking-[-0.03em]">
              Start automating your WhatsApp today.
            </h2>
            <p className="mt-5 text-lg text-gray-400">Use Owivara free for as long as you like. No credit card required.</p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {/* Green CTA with BorderGlow effect */}
              <div className="relative group" style={{ borderRadius: '9999px' }}>
                {/* Outer glow — conic-gradient mask, fades in on hover */}
                <span
                  className="absolute pointer-events-none rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    inset: '-8px',
                    maskImage: 'conic-gradient(from 0deg at center, rgba(34,197,94,0.8) 0%, rgba(34,197,94,0) 25%, rgba(34,197,94,0) 75%, rgba(34,197,94,0.8) 100%)',
                    WebkitMaskImage: 'conic-gradient(from 0deg at center, rgba(34,197,94,0.8) 0%, rgba(34,197,94,0) 25%, rgba(34,197,94,0) 75%, rgba(34,197,94,0.8) 100%)',
                    mixBlendMode: 'plus-lighter',
                    transition: 'opacity 0.7s ease-out',
                  }}
                >
                  <span
                    className="absolute rounded-full"
                    style={{
                      inset: '8px',
                      boxShadow: '0 0 20px rgba(34,197,94,0.4), 0 0 50px rgba(34,197,94,0.2), 0 0 80px rgba(34,197,94,0.1)',
                    }}
                  />
                </span>

                {/* Border glow layer — mesh gradient border with conic mask */}
                <div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700"
                  style={{
                    border: '1.5px solid transparent',
                    background: 'linear-gradient(#22c55e 0 100%) padding-box, conic-gradient(from 0deg at center, rgba(34,197,94,0.6) 0%, rgba(34,197,94,0) 30%, rgba(34,197,94,0) 70%, rgba(34,197,94,0.6) 100%) border-box',
                    maskImage: 'conic-gradient(from 0deg at center, black 10%, transparent 25%, transparent 75%, black 90%)',
                    WebkitMaskImage: 'conic-gradient(from 0deg at center, black 10%, transparent 25%, transparent 75%, black 90%)',
                  }}
                />

                <Link
                  to="/signup"
                  className="relative rounded-full bg-green-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-green-400 transition-all duration-300 whitespace-nowrap overflow-hidden"
                >
                  {/* Glare shimmer — slower, smoother sweep */}
                  <span
                    className="absolute inset-0 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none"
                    style={{
                      background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 42%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.15) 58%, transparent 70%)',
                      backgroundSize: '300% 100%',
                      animation: 'glare-sweep-green 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite',
                    }}
                  />
                  Start free — no card needed
                </Link>
              </div>

              {/* View pricing with glare shimmer */}
              <div className="relative group">
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="relative inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-base font-medium text-white transition-all duration-300 whitespace-nowrap overflow-hidden hover:border-white/10 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.2),0_2px_8px_rgba(0,0,0,0.3)] hover:bg-[linear-gradient(145deg,#2a2a2a_0%,#1a1a1a_50%,#111111_100%)]"
                  style={{
                    background: 'transparent',
                  }}
                >
                  {/* Glare shimmer line on hover */}
                  <span
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 65%)',
                      backgroundSize: '250% 100%',
                      animation: 'glare-sweep 1.5s ease-in-out infinite',
                    }}
                  />
                  View pricing <IconsaxIcon icon="arrow-right" className="text-gray-400 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature marquee — 3 rows, different speeds, dark glossy badges */}
        <div className="bg-[#0a0a0a] overflow-hidden pb-12 relative">
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className={`flex gap-3 py-1.5 ${
                row === 0 ? 'animate-[scroll-left_50s_linear_infinite]' :
                row === 1 ? 'animate-[scroll-right_42s_linear_infinite]' :
                'animate-[scroll-left_55s_linear_infinite]'
              }`}
              style={{ width: 'max-content' }}
            >
              {[...featureMarqueeItems, ...featureMarqueeItems, ...featureMarqueeItems].map((item, i) => {
                const iconColor = iconTints[(i + row) % featureMarqueeItems.length] || '#a3a3a3'
                return (
                  <div
                    key={`${row}-${i}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-full flex-shrink-0 select-none"
                    style={{
                      ...badgeBaseStyle,
                    }}
                  >
                    <span style={{ color: iconColor }} className="flex-shrink-0">{item.icon}</span>
                    <span className="text-xs font-medium whitespace-nowrap">{item.name}</span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        </div> {/* End main content wrapper */}

        {/* Fixed bottom gradual blur */}
        <div
          className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none"
          style={{ opacity: 1 }}
        >
          <GradualBlur
            position="top"
            height="10rem"
            strength={4}
            divCount={10}
            curve="bezier"
            exponential
            opacity={1}
          />
        </div>

        {/* ══ FOOTER — Separated with Top Border ═════════════ */}
        <footer className="bg-[#0a0a0a] px-6 pt-16 pb-10 md:px-12 lg:px-24 border-t border-white/10">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
              {/* Brand Column */}
              <div>
                <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                  <div className="w-10 h-10 rounded-xl overflow-hidden transition-transform duration-200 group-hover:scale-105">
                    <img src="/logo.svg" alt="Owivara" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[18px] font-bold tracking-[-0.02em] text-white">Owivara</span>
                </Link>
                <p className="text-[15px] text-gray-500 leading-relaxed max-w-[280px] mb-6">
                  WhatsApp automation for teams that take their data seriously. Private-first, AI-powered, built for Africa.
                </p>
                {/* Social Icons */}
                <div className="flex gap-3">
                  {['X', 'In', 'Gh', 'Tw'].map((social) => (
                    <a key={social} href="#" onClick={(e) => e.preventDefault()} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:bg-white/10 hover:text-white transition-all duration-200 text-xs font-bold">
                      {social}
                    </a>
                  ))}
                </div>
              </div>

              {/* Product Column */}
              <div>
                <h4 className="text-[12px] font-bold tracking-wider uppercase text-gray-400 mb-5">Product</h4>
                <ul className="flex flex-col gap-3">
                  {['Features', 'Pricing', 'Integrations', 'Changelog', 'Documentation'].map((link) => (
                    <li key={link}><a href="#" onClick={(e) => e.preventDefault()} className="text-[15px] font-medium text-gray-500 hover:text-white transition-colors duration-200">{link}</a></li>
                  ))}
                </ul>
              </div>

              {/* Company Column */}
              <div>
                <h4 className="text-[12px] font-bold tracking-wider uppercase text-gray-400 mb-5">Company</h4>
                <ul className="flex flex-col gap-3">
                  {['About', 'Blog', 'Careers', 'Contact', 'Legal'].map((link) => (
                    <li key={link}><a href="#" onClick={(e) => e.preventDefault()} className="text-[15px] font-medium text-gray-500 hover:text-white transition-colors duration-200">{link}</a></li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[13px] text-gray-600">© 2024–2026 Owivara. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" onClick={(e) => e.preventDefault()} className="text-[13px] text-gray-600 hover:text-gray-400 transition-colors">Privacy Policy</a>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-[13px] text-gray-600 hover:text-gray-400 transition-colors">Terms of Service</a>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-[13px] text-gray-600 hover:text-gray-400 transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </footer>
    </>
  )
}
