## Qwen Added Memories
- OWIVARA PROJECT — COMPLETE CONTEXT

PROJECT: Owivara — WhatsApp Bot Control Panel (Freemium SaaS/BaaS)
TARGET: Nigeria/Africa developers
HOSTING: pxxl.click
BACKEND: InsForge (managed) — project ID 747c6fb5-9a17-412a-972c-c2f98a18e9e6, appkey y2qy69yz, region eu-central

STACK: React 19 + Vite 8 + TypeScript + TailwindCSS v4 + Framer Motion + react-intersection-observer + react-helmet-async
ICON SYSTEM: Inline SVG Iconsax (no library dependency)
FONT: Saans (12 OTF variants: Light 300, Regular 400, Medium 500, SemiBold 600, Bold 700, Heavy 800 — each + italic)
PACKAGE MANAGER: pnpm (npm doesn't support workspace: protocol)

FILE STRUCTURE:
Root: package.json (pnpm workspace), tsconfig.base.json, pnpm-workspace.yaml
apps/dashboard/src/ — main app (landing + auth + dashboard)
  main.tsx — entry, wraps HelmetProvider + QueryClientProvider + BrowserRouter
  App.tsx — router: / → LandingPage, /login → LoginPage, /signup → SignupPage, /dashboard/* → protected DashboardLayout
  index.css — global styles, @font-face for Saans, Tailwind @theme, marquee animation, utility classes
  components/SEOHead.tsx — react-helmet-async wrapper, uses SEO config for meta/OG/Twitter/JSON-LD
  components/dashboard/DashboardLayout.tsx — sidebar layout with mobile responsive, collapse toggle
  config/seo.ts — centralized SEO config (titles, descriptions, OG, Twitter, JSON-LD, page overrides)
  pages/LandingPage.tsx — full landing page (hero, stats, features grid, dashboard preview, pricing, testimonials, CTA, footer)
  pages/LoginPage.tsx — split layout (branding left, form right), Google OAuth, SEOHead with noindex
  pages/SignupPage.tsx — centered form card, Google OAuth, SEOHead with noindex
  pages/DashboardPage.tsx — stats grid, bot list, quick actions, skeleton loading, error state
packages/ — @owivara/types, @owivara/insforge, @owivara/baileys-core, @owivara/ai
.env — VITE_INSFORGE_URL=https://y2qy69yz.eu-central.insforge.app, VITE_INSFORGE_ANON_KEY=ik_05a607d..., DATABASE_URL=postgresql://...

ROUTES:
/ → LandingPage (public, indexed, white bg)
/login → LoginPage (public, noindex, dark bg)
/signup → SignupPage (public, noindex, dark bg)
/dashboard → DashboardLayout → DashboardPage (protected, dark bg)
/dashboard/bots → DashboardLayout → BotPage (protected)
/dashboard/settings → DashboardLayout → SettingsPage (protected)

KEY CSS PATTERNS:
- Landing page: bg-white, text-gray-900 for light mode sections
- Dashboard: bg-[#0B0C10], text-white/gray-200 for dark mode
- Navbar: sticky top-0, backdrop-blur, border-b border-gray-100
- Buttons: rounded-full for CTAs, rounded-xl for secondary, whitespace-nowrap
- Grids: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3/4 for responsive
- Cards: rounded-2xl border border-gray-200 (light) or border border-white/5 bg-white/3 (dark)
- Marquee: .animate-marquee + .marquee-mask (gradient fade edges)
- Floating icons: .floating-icon class with pointer-events-none z-0
- Section spacing: px-6 py-24 md:px-12 lg:px-24

SEO HEADERS (via SEOHead component):
Landing: title="Owivara — WhatsApp Bot Control Panel for Africa", noindex=false
Login: title="Login — Owivara", noindex=true
Signup: title="Sign Up — Owivara", noindex=true

INSFORGE AUTH FLOW:
signUp → signInWithOAuth('google') → signIn(email,pwd) → signOut
isAuthenticated() checks auth.getCurrentUser()
Dashboard protected by isAuthenticated() check

RECENT FIXES APPLIED (all verified with build):
1. index.css — global overflow-x:hidden, body width 100%, marquee-mask gradient, floating-icon pointer-events-none
2. LandingPage — sticky nav with w-full max-w-7xl, hero centered flex col, features CSS grid (not carousel), pricing grid with items-start, footer grid, all buttons whitespace-nowrap
3. DashboardLayout — flex h-screen overflow-hidden, sidebar 240px, main flex-1 overflow-auto, mobile responsive
4. DashboardPage — stats grid cols-4, quick actions grid cols-3, skeleton loading, error state
5. LoginPage/SignupPage — form cards with proper max-width, input/button styling, Google OAuth buttons

BUILD: pnpm run build:dashboard — passes 0 errors
DEV SERVER: http://localhost:5173 — running on port 5173
