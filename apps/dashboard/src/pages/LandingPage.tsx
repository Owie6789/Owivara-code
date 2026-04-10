import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'

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

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1500
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, end])

  return <span ref={ref} className="tabular-nums">{count.toLocaleString()}{suffix}</span>
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
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Map scroll progress (0-1) to active stat index (0, 1, 2)
  const activeIndex = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 1, 2, 2])

  const stats = [
    { value: '2,400+', label: 'bots live and running' },
    { value: '1.2M+', label: 'messages handled' },
    { value: '11,400+', label: 'businesses using Owivara' },
  ]

  return (
    <div ref={containerRef} style={{ height: '300vh' }}>
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center">
        <p className="text-sm font-medium text-gray-400 mb-12">A growing library of</p>
        <div className="relative w-full max-w-lg h-48 flex items-center justify-center overflow-hidden">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{
                opacity: useTransform(activeIndex, (v) => (v === i ? 1 : 0)),
                y: useTransform(activeIndex, (v) => {
                  if (v === i) return 0
                  if (v > i) return -80
                  return 80
                }),
                scale: useTransform(activeIndex, (v) => (v === i ? 1 : 0.85)),
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-[#0a0a0a] tracking-[-0.04em] leading-tight tabular-nums">
                {stat.value}
              </p>
              <p className="mt-3 text-sm md:text-base text-gray-500 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        {/* Progress dots */}
        <div className="flex gap-2 mt-8">
          {stats.map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-gray-300"
              animate={{
                backgroundColor: useTransform(activeIndex, (v) => (v === i ? '#0a0a0a' : '#d1d5db')),
                scale: useTransform(activeIndex, (v) => (v === i ? 1.3 : 1)),
              }}
            />
          ))}
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

const appGridItems = [
  { name: 'Owivara', color: '#22c55e' },
  { name: 'WhatsApp', color: '#25D366' },
  { name: 'Gemini', color: '#4285F4' },
  { name: 'OpenAI', color: '#10a37f' },
  { name: 'InsForge', color: '#6366f1' },
  { name: 'React', color: '#61DAFB' },
  { name: 'Vite', color: '#646CFF' },
  { name: 'Tailwind', color: '#06B6D4' },
  { name: 'TypeScript', color: '#3178C6' },
  { name: 'Node.js', color: '#339933' },
  { name: 'PostgreSQL', color: '#336791' },
  { name: 'Baileys', color: '#8B5CF6' },
]

// ════════════════════════════════════════════════════════════════
// MAIN LANDING PAGE — MOBBIN STYLE
// ════════════════════════════════════════════════════════════════
export default function LandingPage() {
  const [tab, setTab] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const tabs = ['All', 'Setup', 'AI', 'Monitoring']
  const floatingIconsRef = useRef<HTMLDivElement>(null)

  // Scroll detection for nav pill + active section tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setScrolled(scrollY > 60)

      // Detect active section based on scroll position
      const sections = ['features', 'pricing', 'testimonials']
      const offsets = sections.map(id => {
        const el = document.getElementById(id)
        return el ? el.offsetTop - 120 : 0
      })
      const heights = sections.map(id => {
        const el = document.getElementById(id)
        return el ? el.offsetHeight : 0
      })

      let current = ''
      for (let i = 0; i < sections.length; i++) {
        if (scrollY >= offsets[i] && scrollY < offsets[i] + heights[i]) {
          current = sections[i]
          break
        }
      }
      setActiveSection(current)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Run once on mount
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Floating icons entry animation
  useEffect(() => {
    if (!floatingIconsRef.current) return
    const icons = floatingIconsRef.current.querySelectorAll('.floating-icon')
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
      { threshold: 0.3 }
    )
    observer.observe(floatingIconsRef.current)
    return () => observer.disconnect()
  }, [])

  const filteredFeatures =
    tab === 0 ? features :
    tab === 1 ? features.filter(f => f.tab === 'Setup') :
    tab === 2 ? features.filter(f => f.tab === 'AI') :
    features.filter(f => f.tab === 'Monitoring')

  return (
    <>
      <SEOHead
        title="Owivara — WhatsApp Bot Control Panel for Africa"
        description="The freemium WhatsApp bot platform for Nigeria and Africa. Build AI-powered bots without coding. Private, secure, and fast."
        path="/"
      />
      <div className="min-h-screen w-full bg-white font-sans text-[#0a0a0a]">

        {/* ══ NAV — Frosted Glass Layered Darker ═══════════════ */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none" style={{ paddingTop: '12px', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}>
          {/* The actual pill */}
          <motion.div
            className="pointer-events-all relative flex items-center rounded-full overflow-hidden"
            animate={{
              maxWidth: scrolled ? 720 : 520,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              minHeight: '48px',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              background: 'rgba(255, 255, 255, 0.72)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div className="flex items-center w-full rounded-full" style={{ minHeight: '48px', paddingLeft: '16px', paddingRight: '12px' }}>
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 shrink-0 mr-2 group" aria-label="Owivara home">
                <div className="w-7 h-7 rounded-lg overflow-hidden transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
                  <img src="/logo.svg" alt="Owivara" className="w-full h-full object-cover" />
                </div>
                <span className="text-[14px] font-bold tracking-[-0.02em] text-[#0a0a0a] leading-none whitespace-nowrap">Owivara</span>
              </Link>

              {/* Center Links (desktop) — fixed positions, sliding active indicator */}
              <div className="hidden md:flex items-center gap-0 ml-3 mr-auto relative">
                {/* Sliding active pill background */}
                <motion.div
                  className="absolute h-7 rounded-full bg-gray-100/80"
                  animate={{
                    x: activeSection === 'features' ? 0 : activeSection === 'pricing' ? 84 : activeSection === 'testimonials' ? 168 : -100,
                    opacity: activeSection ? 1 : 0,
                    width: 84,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
                {[
                  { label: 'Features', id: 'features' },
                  { label: 'Pricing', id: 'pricing' },
                  { label: 'Reviews', id: 'testimonials' },
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`relative z-10 flex items-center justify-center px-3 py-1.5 text-[13px] font-medium rounded-full whitespace-nowrap leading-none transition-colors duration-200 ${
                      activeSection === item.id ? 'text-[#0a0a0a]' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={{ width: '84px' }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-0.5 shrink-0 ml-1">
                <Link to="/login" className="hidden sm:flex items-center px-2.5 py-1.5 text-[13px] font-medium text-gray-500 rounded-full whitespace-nowrap leading-none transition-colors duration-200 hover:bg-gray-100/50 hover:text-gray-700" style={{ textDecoration: 'none' }}>
                  Log in
                </Link>

                {/* Join for free — collapses width when hidden */}
                <motion.div
                  animate={{
                    width: scrolled ? 108 : 0,
                    opacity: scrolled ? 1 : 0,
                    marginLeft: scrolled ? 4 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="overflow-hidden"
                  style={{ minWidth: 0 }}
                >
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center rounded-full bg-[#0a0a0a] text-[13px] font-semibold text-white whitespace-nowrap leading-none hover:bg-[#1a1a1a] active:scale-95 transition-all duration-150"
                    style={{ padding: '7px 14px', letterSpacing: '-0.01em' }}
                  >
                    Join for free
                  </Link>
                </motion.div>

                {/* Hamburger (mobile only) */}
                <button
                  className="flex items-center justify-center rounded-lg p-1.5 text-gray-500 hover:bg-gray-100/50 hover:text-gray-700 active:scale-95 md:hidden transition-all duration-150 ml-0.5"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6L18 18" /></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6H20M4 12H20M4 18H20" /></svg>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </nav>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="fixed top-[72px] left-4 right-4 z-40 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-xl px-5 pb-5 pt-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)] md:hidden">
            <div className="flex flex-col gap-0.5">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors">Features</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors">Pricing</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors">Reviews</a>
              <div className="mt-2 flex flex-col gap-2 border-t border-gray-100 pt-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 active:bg-gray-50 transition-colors">Log in</Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="rounded-xl bg-[#0a0a0a] px-4 py-2.5 text-center text-sm font-semibold text-white active:bg-[#1a1a1a] transition-colors">Join for free</Link>
              </div>
            </div>
          </div>
        )}

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
            <a href="#pricing" className="inline-flex items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-5 py-3 text-[15px] font-semibold text-[#0a0a0a] transition-all duration-150 hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-[0.98] whitespace-nowrap">
              See our plans
              <IconsaxIcon icon="arrow-right" className="text-gray-500" />
            </a>
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
        <Section id="features" className="px-6 py-24 md:px-12 lg:px-24 text-center">
          <div className="mx-auto max-w-[700px]">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.08] tracking-[-0.035em] text-[#0a0a0a]">
              From inspiration to creation
            </h2>
          </div>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-1 bg-gray-100 rounded-full p-1">
              {tabs.map((t, idx) => (
                <button
                  key={t}
                  onClick={() => setTab(idx)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-250 whitespace-nowrap ${
                    tab === idx ? 'bg-white text-[#0a0a0a] shadow-sm' : 'text-gray-500 hover:text-[#0a0a0a]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-12 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollBehavior: 'smooth' }}>
              {filteredFeatures.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="w-72 flex-shrink-0 rounded-2xl bg-gray-100 overflow-hidden shadow-md hover:shadow-lg hover:-translate-y-1.5 transition-all duration-250"
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
            </div>
          </div>
        </Section>

        {/* ══ STATS — Scroll-Jacked Reveal + Floating Icons ═══ */}
        <Section className="relative px-6 py-40 overflow-hidden text-center md:px-12 lg:px-24" ref={floatingIconsRef}>
          <p className="text-sm font-medium text-gray-400 mb-12 relative z-10">A growing library of</p>

          {/* Scroll-jacked stats stack */}
          <div className="relative z-10 flex flex-col items-center gap-16">
            <ScrollJackedStat value={<><AnimatedCounter end={2400} suffix="+" /> bots</>} label="live and running" index={0} />
            <ScrollJackedStat value={<><AnimatedCounter end={1200000} suffix="+" /></>} label="messages handled" index={1} />
            <ScrollJackedStat value={<><AnimatedCounter end={11400} suffix="+" /></>} label="businesses using Owivara" index={2} />
          </div>

          {/* Floating icons with physics — hidden on mobile */}
          <div className="absolute inset-0 pointer-events-none hidden sm:block" ref={floatingIconsRef}>
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
        </Section>

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
              <Link to="/signup" className="rounded-full bg-green-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-green-400 transition-colors whitespace-nowrap">
                Start free — no card needed
              </Link>
              <a href="#pricing" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-base font-medium text-white hover:bg-white/10 transition-colors whitespace-nowrap">
                View pricing <IconsaxIcon icon="arrow-right" className="text-gray-400" />
              </a>
            </div>
          </div>
        </section>

        {/* App grid marquee — 3 rows, different speeds */}
        <div className="bg-[#0a0a0a] overflow-hidden pb-12">
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className={`flex gap-3 py-1.5 ${
                row === 0 ? 'animate-[scroll-left_40s_linear_infinite]' :
                row === 1 ? 'animate-[scroll-right_35s_linear_infinite]' :
                'animate-[scroll-left_45s_linear_infinite]'
              }`}
              style={{ width: 'max-content' }}
            >
              {[...appGridItems, ...appGridItems, ...appGridItems].map((app, i) => (
                <div
                  key={`${row}-${i}`}
                  className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 flex-shrink-0"
                >
                  <div className="w-6 h-6 rounded flex-shrink-0" style={{ backgroundColor: app.color }} />
                  <span className="text-xs font-medium text-gray-400 whitespace-nowrap">{app.name}</span>
                </div>
              ))}
            </div>
          ))}
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
                    <a key={social} href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:bg-white/10 hover:text-white transition-all duration-200 text-xs font-bold">
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
                    <li key={link}><a href="#" className="text-[15px] font-medium text-gray-500 hover:text-white transition-colors duration-200">{link}</a></li>
                  ))}
                </ul>
              </div>

              {/* Company Column */}
              <div>
                <h4 className="text-[12px] font-bold tracking-wider uppercase text-gray-400 mb-5">Company</h4>
                <ul className="flex flex-col gap-3">
                  {['About', 'Blog', 'Careers', 'Contact', 'Legal'].map((link) => (
                    <li key={link}><a href="#" className="text-[15px] font-medium text-gray-500 hover:text-white transition-colors duration-200">{link}</a></li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[13px] text-gray-600">© 2024–2026 Owivara. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="text-[13px] text-gray-600 hover:text-gray-400 transition-colors">Privacy Policy</a>
                <a href="#" className="text-[13px] text-gray-600 hover:text-gray-400 transition-colors">Terms of Service</a>
                <a href="#" className="text-[13px] text-gray-600 hover:text-gray-400 transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
