import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'

// ─── Iconsax SVG Icon Components ────────────────────────────────────────────
const IconsaxIcon = ({ icon, className = '' }: { icon: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    message: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 12.5H8.51M12 12.5H12.01M15.5 12.5H15.51M2 8.5C2 4.91015 4.91015 2 8.5 2H15.5C19.0899 2 22 4.91015 22 8.5V15.5C22 19.0899 19.0899 22 15.5 22H13C11.5858 22 10.2297 21.548 9.1083 20.7206L4.33452 21.784C3.53459 21.9623 2.80459 21.2323 2.98287 20.4324L3.55697 17.8484C2.56325 16.5581 2 14.9458 2 13.2049V8.5Z" /></svg>,
    android: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 12.5V15.5M12.5 12.5V15.5M16.5 12.5V15.5M6.5 10.5H17.5M6.5 14.5H17.5M10 7.5V10.5M14 7.5V10.5M4 10.5V14.5C4 17.8137 6.68629 20.5 10 20.5H14C17.3137 20.5 20 17.8137 20 14.5V10.5M6.5 10.5C6.5 8.01472 8.51472 6 11 6H13C15.4853 6 17.5 8.01472 17.5 10.5M4 10.5V8.5C4 7.39543 4.89543 6.5 6 6.5H18C19.1046 6.5 20 7.39543 20 8.5V10.5" /></svg>,
    bolt: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4.5 12.5H11L10 22L19.5 11.5H12.5L13 2Z" /></svg>,
    mobile: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2V4M16 2V4M6 6H18C19.1046 6 20 6.89543 20 8V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V8C4 6.89543 4.89543 6 6 6ZM12 17V17.01" /></svg>,
    lock: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11.5V8.5C7 5.46243 9.46243 3 12.5 3V3C15.5376 3 18 5.46243 18 8.5V11.5M12 15.5V18.5M9 21H16C17.1046 21 18 20.1046 18 19V14C18 12.8954 17.1046 12 16 12H9C7.89543 12 7 12.8954 7 14V19C7 20.1046 7.89543 21 9 21Z" /></svg>,
    rocket: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5L3 21L7.5 19.5M4.5 16.5L7.5 19.5M4.5 16.5C4.5 16.5 8 12 12 10C16 8 21 3 21 3C21 3 16 8 14 12C12 16 7.5 19.5 7.5 19.5" /></svg>,
    bot: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2V6M8 6H16C17.1046 6 18 6.89543 18 8V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V8C6 6.89543 6.89543 6 8 6ZM9.5 12H9.51M14.5 12H14.51M5 10H3C2.44772 10 2 10.4477 2 11V15C2 15.5523 2.44772 16 3 16H5M19 10H21C21.5523 10 22 10.4477 22 11V15C22 15.5523 21.5523 16 21 16H19" /></svg>,
    'message-square': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 12.5H8.51M12 12.5H12.01M15.5 12.5H15.51M2 8.5C2 4.91015 4.91015 2 8.5 2H15.5C19.0899 2 22 4.91015 22 8.5V15.5C22 19.0899 19.0899 22 15.5 22H13C11.5858 22 10.2297 21.548 9.1083 20.7206L4.33452 21.784C3.53459 21.9623 2.80459 21.2323 2.98287 20.4324L3.55697 17.8484C2.56325 16.5581 2 14.9458 2 13.2049V8.5Z" /></svg>,
    zap: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4.5 12.5H11L10 22L19.5 11.5H12.5L13 2Z" /></svg>,
    shield: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L4.5 6.5V11C4.5 15.5 7.5 19.5 12 21C16.5 19.5 19.5 15.5 19.5 11V6.5L12 3Z" /></svg>,
    sparkles: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2ZM19 15L19.75 17.25L22 18L19.75 18.75L19 21L18.25 18.75L16 18L18.25 17.25L19 15Z" /></svg>,
    activity: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12H6L9 5L13 19L16 12H21" /></svg>,
    quote: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21C3 21 4 16 4 12C4 8 7 6 10 6C10 6 8 9 8 11C8 13 9.5 14 11 14C12.5 14 14 12.5 14 11C14 9.5 12 6 9 6M14 21C14 21 15 16 15 12C15 8 18 6 21 6C21 6 19 9 19 11C19 13 20.5 14 22 14" /></svg>,
    users: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8.5C16 10.433 14.433 12 12.5 12C10.567 12 9 10.433 9 8.5C9 6.567 10.567 5 12.5 5C14.433 5 16 6.567 16 8.5ZM5 18C5 15.7909 6.79086 14 9 14H16C18.2091 14 20 15.7909 20 18V19C20 19.5523 19.5523 20 19 20H6C5.44772 20 5 19.5523 5 19V18Z" /></svg>,
    'arrow-right': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12H20M20 12L14 6M20 12L14 18" /></svg>,
    'check': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17L4 12" /></svg>,
    'grid': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  }
  return <span className={`inline-flex items-center justify-center ${className}`}>{icons[icon] || null}</span>
}

// ─── Floating Icon ────────────────────────────────────────────────────────────
function FloatingIcon({ icon, color, delay }: { icon: string; color: string; delay: number }) {
  return (
    <motion.div
      className={`floating-icon absolute flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${color}`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0, 1, 1.05, 1], y: [0, -16, 0, -8], rotate: [0, 4, -4, 0] }}
      transition={{ duration: 6, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <IconsaxIcon icon={icon} className="text-white" />
    </motion.div>
  )
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ end, duration = 2, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [ref, inView] = useInView({ triggerOnce: true })
  useState(() => {
    if (!inView) return
    let start = 0
    const increment = end / (duration * 60)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 1000 / 60)
    return () => clearInterval(timer)
  })
  return <span ref={ref} className="tabular-nums">{count.toLocaleString()}{suffix}</span>
}

// ─── Scroll-reveal Section ────────────────────────────────────────────────────
function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const [ref, inView] = useInView({ threshold: 0.08, triggerOnce: true })
  return (
    <motion.section id={id} ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: 'easeOut' }} className={className}>
      {children}
    </motion.section>
  )
}

// ─── Trust Logos Marquee ──────────────────────────────────────────────────────
const trustLogos = ['Flutterwave', 'Paystack', 'Andela', 'Interswitch', 'MTN', 'Airtel', 'Glo', 'Opay', 'Moniepoint', 'Kuda', 'Carbon', 'PiggyVest']

function TrustLogosMarquee() {
  const repeated = [...trustLogos, ...trustLogos, ...trustLogos]
  return (
    <div className="relative overflow-hidden marquee-mask">
      <div className="flex animate-marquee whitespace-nowrap">
        {repeated.map((logo, i) => (
          <span key={i} className="inline-block pr-12 text-base font-semibold text-gray-400 shrink-0">{logo}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Feature Cards Data ───────────────────────────────────────────────────────
const features = [
  { icon: 'bot', title: 'Multi-bot management', description: 'Run separate WhatsApp numbers for support, sales, and ops — all under one login. Spin up a new bot in under 3 minutes.' },
  { icon: 'message-square', title: 'Live message console', description: 'See every conversation happening across all your bots in real-time. No more checking 6 different phones.' },
  { icon: 'zap', title: 'Bring your own AI key', description: 'Connect your Gemini or OpenAI API key once. Owivara uses it for every AI response — you pay the API directly.' },
  { icon: 'shield', title: 'Row-level data isolation', description: 'Your bot data is isolated at the database level. Not by a filter — by Postgres RLS. Other users physically cannot access your records.' },
  { icon: 'sparkles', title: 'Configurable AI persona', description: 'Your bot isn\'t "an AI assistant." It\'s Amara from NaijaMart, or Tunde from QuickServe. Set name, tone, language, boundaries.' },
  { icon: 'activity', title: 'Message volume analytics', description: 'See daily message volume, peak hours, response rate, and drop-off points. Know which bot is underperforming before your customers do.' },
]

// ─── Feature Grid (replaces horizontal carousel) ──────────────────────────────
function FeatureGrid({ activeTab }: { activeTab: number }) {
  const filtered = activeTab === 0 ? features : activeTab === 1 ? features.slice(0, 2) : activeTab === 2 ? features.slice(2, 4) : features.slice(4)
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {filtered.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: i * 0.08 }} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-700"><IconsaxIcon icon={f.icon} /></div>
            <h3 className="mb-2 text-base font-semibold text-gray-900">{f.title}</h3>
            <p className="text-sm leading-relaxed text-gray-500">{f.description}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────
function TestimonialCard({ name, role, text }: { name: string; role: string; text: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-6 break-inside-avoid rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4"><IconsaxIcon icon="quote" className="text-gray-300" /></div>
      <p className="mb-5 text-sm leading-relaxed text-gray-600">{text}</p>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex-shrink-0" />
        <div><p className="text-sm font-semibold text-gray-900">{name}</p><p className="text-xs text-gray-500">{role}</p></div>
      </div>
    </motion.div>
  )
}

const testimonials = [
  { name: 'Adebayo Ogunlesi', role: 'CTO, TechBro Lagos — 12-person team', text: "We were managing support for 3 products across 3 different WhatsApp numbers. Owivara gave us one dashboard and proper business numbers in an afternoon. The ops team hasn't asked me to 'check the WhatsApp' in 4 months." },
  { name: 'Chioma Nwosu', role: 'Founder, NaijaMart', text: "I nearly didn't sign up because I'd seen too many platforms that promise privacy and then log everything. The RLS explanation on the pricing page is what convinced me. My customers' data is mine, not a training dataset." },
  { name: 'Emeka Okafor', role: 'Solo developer, building for 3 SMEs', text: "I was paying ₦40k to another platform per client just for AI. Switched to Owivara BYOK — now I pay Google directly, which for my volume is about ₦3,000/month per client. That margin difference paid for a year of Owivara Pro." },
  { name: 'Fatima Abdullahi', role: 'Head of Product, PayHub Fintech', text: "Our compliance team had questions about where customer messages were stored. We could answer every single one because Owivara's data model is documented and the storage is in a region we control. That conversation used to take weeks." },
  { name: 'Tunde Bakare', role: 'CEO, QuickServe Logistics', text: "10,000 WhatsApp conversations our first month sounds like a flex. It was actually a disaster. Owivara's AI handled 78% of them with zero escalation. We hired one person instead of eight." },
  { name: 'Ngozi Eze', role: 'Lead Engineer, AppNation', text: "I've integrated with 4 WhatsApp API providers in 2 years. Owivara is the first one where the QR reconnection actually works reliably. That sounds like a low bar. In this space, it is not." },
]

// ─── Pricing Plans ────────────────────────────────────────────────────────────
const plans = [
  { name: 'Starter', price: '₦0', period: 'forever', description: 'For individuals getting their first bot running.', features: ['1 bot instance', '2,000 messages per month', 'Basic message console', 'Community support (Discord)'], cta: 'Start free', highlighted: false },
  { name: 'Pro', price: '₦15,000', period: 'per month', description: 'For teams running WhatsApp as a real business channel.', features: ['10 bot instances', '100,000 messages per month', 'BYOK — Gemini & OpenAI', 'Live message console', 'Persona editor', '3 team seats included', 'Email support (< 24h response)'], cta: 'Start Pro trial', highlighted: true },
  { name: 'Scale', price: '₦45,000', period: 'per month', description: 'For operations where WhatsApp IS the product.', features: ['Unlimited bot instances', 'Unlimited messages', 'BYOK + custom model endpoints', 'Priority support + SLA', 'Custom analytics exports', 'Unlimited team seats', 'Dedicated onboarding call'], cta: 'Contact sales', highlighted: false },
]

// ════════════════════════════════════════════════════════════════
// MAIN LANDING PAGE COMPONENT
// ════════════════════════════════════════════════════════════════
export default function LandingPage() {
  const [tab, setTab] = useState(0)
  const tabs = ['All', 'Setup', 'AI', 'Monitoring']

  return (
    <>
      <SEOHead title="Owivara — WhatsApp Bot Control Panel for Africa" description="The freemium WhatsApp bot platform for Nigeria and Africa. Build AI-powered bots without coding. Private, secure, and fast." path="/" />
      <div className="min-h-screen w-full bg-white font-sans">

        {/* ══ NAV ═════════════════════════════════════════════════ */}
        <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-12 lg:px-24">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-500"><IconsaxIcon icon="bot" className="text-white" /></div>
              <span className="text-lg font-bold tracking-tight text-gray-900">Owivara</span>
            </Link>
            <div className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap">Features</a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap">Pricing</a>
              <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap">Reviews</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="hidden text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors sm:block whitespace-nowrap">Log in</Link>
              <Link to="/signup" className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors whitespace-nowrap">Join for free</Link>
            </div>
          </div>
        </nav>

        {/* ══ HERO ═════════════════════════════════════════════════ */}
        <div className="flex w-full flex-col items-center justify-center px-6 pt-36 pb-28 text-center md:px-12 lg:px-24">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-medium text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />✦ Now in public beta — 2,400+ bots active today
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="max-w-4xl text-5xl font-bold leading-tight tracking-tight text-gray-900 md:text-7xl">
            The command centre for your <span className="bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">WhatsApp bots.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-500 md:text-xl">
            Most WhatsApp bot tools give you a phone number and leave you to figure out the rest. Owivara gives you a full operating layer: real-time message visibility, multi-bot management, and AI responses that use your own API key.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-4">
            <Link to="/signup" className="rounded-full bg-gray-900 px-8 py-3.5 text-base font-semibold text-white hover:bg-gray-700 transition-colors whitespace-nowrap">Start for free</Link>
            <a href="#pricing" className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-8 py-3.5 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">See pricing <IconsaxIcon icon="arrow-right" className="text-gray-500" /></a>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} className="mt-20 w-full max-w-3xl">
            <p className="mb-6 text-xs font-medium uppercase tracking-widest text-gray-400">Used in production by teams at</p>
            <div className="overflow-hidden marquee-mask">
              <div className="flex animate-marquee whitespace-nowrap">
                {[...trustLogos, ...trustLogos, ...trustLogos].map((logo, i) => (<span key={i} className="inline-block pr-10 text-sm font-semibold text-gray-300 shrink-0">{logo}</span>))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ══ STATS ═══════════════════════════════════════════════ */}
        <Section className="relative w-full overflow-hidden bg-gray-50 px-6 py-24 md:px-12 lg:px-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-base font-medium text-gray-500">Numbers from this week, not a pitch deck.</p>
            <div className="relative mt-16 min-h-[320px]">
              <div className="pointer-events-none absolute inset-0 hidden sm:block">
                <div className="absolute left-0 top-4"><FloatingIcon icon="message" color="bg-green-500" delay={0} /></div>
                <div className="absolute right-0 top-0"><FloatingIcon icon="grid" color="bg-blue-500" delay={0.6} /></div>
                <div className="absolute bottom-8 left-8"><FloatingIcon icon="bolt" color="bg-yellow-400" delay={1.2} /></div>
                <div className="absolute right-8 top-1/2"><FloatingIcon icon="mobile" color="bg-purple-500" delay={1.8} /></div>
              </div>
              <div className="relative z-10 flex flex-col items-center justify-center py-8 gap-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                  <p className="text-7xl font-bold tracking-tight text-gray-900 md:text-8xl"><AnimatedCounter end={2400} suffix="+" /></p>
                  <p className="mt-1 text-sm font-medium text-gray-500">Active bots right now</p>
                </motion.div>
                <div className="mt-10 flex flex-col items-center gap-8 sm:flex-row sm:gap-24">
                  <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                    <p className="text-4xl font-bold text-gray-800 md:text-5xl"><AnimatedCounter end={1200000} suffix="+" /></p>
                    <p className="mt-1 text-sm text-gray-500">Messages handled this month</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                    <p className="text-4xl font-bold text-gray-800 md:text-5xl"><AnimatedCounter end={11400} suffix="+" /></p>
                    <p className="mt-1 text-sm text-gray-500">Businesses and developers using Owivara</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ══ FEATURES ═════════════════════════════════════════════ */}
        <Section id="features" className="w-full px-6 py-24 md:px-12 lg:px-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-green-600">Features</p>
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">The parts your current setup<br className="hidden sm:block" /> is missing.</h2>
              <p className="mt-4 text-lg text-gray-500">Most teams run their WhatsApp bots across 3 different tools, 2 Notion docs, and a shared WhatsApp number nobody owns. Owivara consolidates all of it.</p>
            </div>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-full border border-gray-200 bg-gray-100 p-1">
                {tabs.map((t, idx) => (
                  <button key={t} onClick={() => setTab(idx)} className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${tab === idx ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>{t}</button>
                ))}
              </div>
            </div>
            <FeatureGrid activeTab={tab} />
          </div>
        </Section>

        {/* ══ DASHBOARD PREVIEW ═══════════════════════════════════ */}
        <Section className="w-full bg-gray-50 px-6 py-24 md:px-12 lg:px-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-green-600">Dashboard</p>
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">Explore your entire bot operation<br className="hidden sm:block" /> from one place.</h2>
            </div>
            <div className="mt-12 flex flex-col gap-6 rounded-2xl overflow-hidden md:flex-row">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 rounded-2xl bg-gray-900 p-6 text-white">
                <div className="mb-4 flex gap-1.5"><div className="h-3 w-3 rounded-full bg-red-500" /><div className="h-3 w-3 rounded-full bg-yellow-500" /><div className="h-3 w-3 rounded-full bg-green-500" /></div>
                <div className="space-y-3">
                  <div className="rounded-xl bg-gray-800 p-4"><p className="text-sm font-semibold">Bot Dashboard</p><p className="mt-1 text-xs text-gray-400">Monitor all your bots in one place</p></div>
                  <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4"><p className="text-sm font-semibold text-green-400">QR Code Linker</p><p className="mt-1 text-xs text-green-300">Link WhatsApp in seconds</p></div>
                  <div className="rounded-xl bg-gray-800 p-4"><p className="text-sm font-semibold">Message Console</p><p className="mt-1 text-xs text-gray-400">Real-time conversation view</p></div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 rounded-2xl bg-gray-950 p-6 text-white">
                <div className="mb-4 flex gap-1.5"><div className="h-3 w-3 rounded-full bg-red-500" /><div className="h-3 w-3 rounded-full bg-yellow-500" /><div className="h-3 w-3 rounded-full bg-green-500" /></div>
                <div className="space-y-3">
                  <div className="rounded-xl bg-gray-800 p-4"><p className="text-sm font-semibold">AI Configuration</p><p className="mt-1 text-xs text-gray-400">Set your Gemini or OpenAI key</p></div>
                  <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4"><p className="text-sm font-semibold text-green-400">Response Templates</p><p className="mt-1 text-xs text-green-300">Customize bot personality</p></div>
                  <div className="rounded-xl bg-gray-800 p-4"><p className="text-sm font-semibold">Analytics View</p><p className="mt-1 text-xs text-gray-400">Track performance metrics</p></div>
                </div>
              </motion.div>
            </div>
          </div>
        </Section>

        {/* ══ PRICING ═════════════════════════════════════════════ */}
        <Section id="pricing" className="w-full px-6 py-24 md:px-12 lg:px-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-green-600">Pricing</p>
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">Pricing that makes sense<br className="hidden sm:block" /> in naira and in logic.</h2>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3 items-start">
              {plans.map((plan, i) => (
                <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`relative rounded-2xl border p-8 flex flex-col gap-4 ${plan.highlighted ? 'border-green-500 border-2 bg-white shadow-lg' : 'border-gray-200 bg-white'}`}>
                  {plan.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-b-lg bg-green-500 px-4 py-1 text-xs font-bold text-white whitespace-nowrap">Most popular</div>}
                  <div className={plan.highlighted ? 'pt-2' : ''}>
                    <p className="text-sm font-semibold text-gray-500">{plan.name}</p>
                    <div className="mt-2 flex items-baseline gap-1"><span className="text-4xl font-bold text-gray-900">{plan.price}</span><span className="text-sm text-gray-500">/{plan.period}</span></div>
                    <p className="mt-3 text-sm text-gray-500">{plan.description}</p>
                  </div>
                  <ul className="flex-1 space-y-2">
                    {plan.features.map((f) => (<li key={f} className="flex items-center gap-2 text-sm text-gray-700"><IconsaxIcon icon="check" className="text-green-500 shrink-0" />{f}</li>))}
                  </ul>
                  <button className={`w-full rounded-xl py-3 text-sm font-semibold text-center whitespace-nowrap cursor-pointer ${plan.highlighted ? 'bg-gray-900 text-white border-none' : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'}`}>{plan.cta}</button>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ══ TESTIMONIALS ═══════════════════════════════════════ */}
        <Section id="testimonials" className="w-full bg-gray-50 px-6 py-24 md:px-12 lg:px-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-green-600">Reviews</p>
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">What teams said after<br className="hidden sm:block" /> their first month live.</h2>
            </div>
            <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3">
              {testimonials.map((t, i) => (<TestimonialCard key={i} name={t.name} role={t.role} text={t.text} />))}
            </div>
          </div>
        </Section>

        {/* ══ FINAL CTA ══════════════════════════════════════════ */}
        <Section className="w-full bg-gray-900 px-6 py-24 md:px-12 lg:px-24">
          <div className="mx-auto max-w-3xl text-center text-white">
            <h2 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">Start automating your<br className="hidden sm:block" /> WhatsApp today.</h2>
            <p className="mt-6 text-lg text-gray-400">Use Owivara free for as long as you like, or get full access with any of our paid plans. No credit card required to start.</p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/signup" className="rounded-full bg-green-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-green-400 transition-colors whitespace-nowrap">Start free — no card needed</Link>
              <a href="#pricing" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-base font-medium text-white hover:bg-white/10 transition-colors whitespace-nowrap">View pricing <IconsaxIcon icon="arrow-right" className="text-gray-400" /></a>
            </div>
            <div className="mt-12 marquee-mask"><TrustLogosMarquee /></div>
          </div>
        </Section>

        {/* ══ FOOTER ═════════════════════════════════════════════ */}
        <footer className="w-full bg-gray-950 px-6 py-16 md:px-12 lg:px-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-500"><IconsaxIcon icon="bot" className="text-white" /></div><span className="text-lg font-bold text-white">Owivara</span></div>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-500">WhatsApp automation for teams that take their data seriously. Built for Africa, trusted globally.</p>
              </div>
              <div>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Explore</h4>
                <ul className="space-y-3"><li><a href="#features" className="text-sm text-gray-500 hover:text-white transition-colors">Features</a></li><li><a href="#pricing" className="text-sm text-gray-500 hover:text-white transition-colors">Pricing</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Documentation</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Blog</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Changelog</a></li></ul>
              </div>
              <div>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Connect</h4>
                <ul className="space-y-3"><li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Help Center</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Community</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Twitter / X</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">LinkedIn</a></li><li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Email Us</a></li></ul>
              </div>
            </div>
            <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
              <p className="text-sm text-gray-600">© Owivara 2024–2026. All rights reserved.</p>
              <div className="flex gap-6"><a href="#" className="text-sm text-gray-600 hover:text-white transition-colors">Privacy Policy</a><a href="#" className="text-sm text-gray-600 hover:text-white transition-colors">Terms of Service</a><a href="#" className="text-sm text-gray-600 hover:text-white transition-colors">Cookie Settings</a></div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
