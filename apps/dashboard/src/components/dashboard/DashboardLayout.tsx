import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { signOut } from '@owivara/insforge'
import { cn } from '../../lib/utils'
import { LayoutDashboard, Bot, Settings, LogOut, Menu, X, ChevronLeft } from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Bot,             label: 'Bots',      path: '/dashboard/bots' },
  { icon: Settings,        label: 'Settings',  path: '/dashboard/settings' },
]

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  // FIX: Desktop sidebar defaults open, mobile defaults closed
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768)
  // Mobile overlay: true when sidebar is open on small screen
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // FIX: Active check uses startsWith so nested paths highlight correctly
  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0C10] text-gray-100">

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/5 bg-[#0D0E12] transition-all duration-300',
          // Mobile: slide in/out
          'md:relative md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          // Desktop: collapse to icon-only
          sidebarOpen ? 'md:w-60' : 'md:w-16',
          // Mobile always full width when open
          'w-60'
        )}
      >
        {/* Logo / Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 px-4">
          {sidebarOpen && (
            <Link to="/dashboard" className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-500/20 border border-green-500/30">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2V6M8 6H16C17.1046 6 18 6.89543 18 8V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V8C6 6.89543 6.89543 6 8 6ZM9.5 12H9.51M14.5 12H14.51M5 10H3C2.44772 10 2 10.4477 2 11V15C2 15.5523 2.44772 16 3 16H5M19 10H21C21.5523 10 22 10.4477 22 11V15C22 15.5523 21.5523 16 21 16H19" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white">Owivara</span>
            </Link>
          )}
          {/* Desktop collapse toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="hidden rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-white transition-colors md:flex"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <Menu size={16} />}
          </button>
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-white md:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-label={!sidebarOpen ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-green-500/10 text-green-400'
                    : 'text-gray-500 hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon size={17} className="shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="shrink-0 border-t border-white/5 p-2.5">
          <button
            onClick={handleSignOut}
            aria-label="Sign out"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut size={17} className="shrink-0" />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Mobile top header bar */}
        <header className="flex h-14 shrink-0 items-center border-b border-white/5 bg-[#0D0E12] px-4 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-white"
          >
            <Menu size={18} />
          </button>
          <span className="ml-3 text-sm font-bold text-white">Owivara</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
