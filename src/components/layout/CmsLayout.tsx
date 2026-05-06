import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, User, Package, CreditCard,
  PenTool, Users, Wallet, Send,
  ChevronLeft, LogOut, Settings, Menu,
  Megaphone, Image, BookOpen, Building2,
  ShoppingBag, Briefcase, CalendarDays, MessageSquare, History, Link2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { BrandLogo } from '@/components/branding/BrandLogo'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, User, Package, CreditCard,
  PenTool, Users, Wallet, Send, Settings,
  Megaphone, Image, BookOpen, Building2,
  ShoppingBag, Briefcase, CalendarDays, MessageSquare, History, Link2,
}

interface SidebarLink {
  label: string
  href: string
  icon: string
}

interface CmsLayoutProps {
  children: React.ReactNode
  sidebarLinks: readonly SidebarLink[]
  title: string
  subtitle?: string
  defaultCollapsed?: boolean
  hideHeader?: boolean
  mainClassName?: string
  contentClassName?: string
}

function SidebarContent({ links, collapsed }: { links: readonly SidebarLink[], collapsed: boolean }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <Link to="/" className="shrink-0" id="cms-logo">
          <BrandLogo compact theme="dark" variant={collapsed ? 'icon' : 'full'} />
        </Link>
        {!collapsed && (
          <span className="text-xs text-sidebar-foreground/50 label-text">CMS</span>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = iconMap[link.icon] || LayoutDashboard
          const isActive = link.href === '/admin' || link.href === '/cms'
            ? location.pathname === link.href
            : location.pathname === link.href || location.pathname.startsWith(`${link.href}/`)

          return (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-280',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
              id={`cms-nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={() => {
            void logout()
            navigate('/masuk')
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 w-full transition-colors duration-280"
          id="cms-logout"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </div>
  )
}

export function CmsLayout({
  children,
  sidebarLinks,
  title,
  subtitle,
  defaultCollapsed = false,
  hideHeader = false,
  mainClassName,
  contentClassName,
}: CmsLayoutProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={cn(
          'hidden lg:block border-r border-border shrink-0 transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="fixed top-0 h-screen" style={{ width: collapsed ? 64 : 256 }}>
          <SidebarContent links={sidebarLinks} collapsed={collapsed} />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {!hideHeader && (
          <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border">
            <div className="flex items-center justify-between px-4 lg:px-8 h-16">
              <div className="flex items-center gap-3">
                <div className="lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" id="cms-mobile-menu">
                        <Menu className="w-5 h-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 bg-sidebar">
                      <SidebarContent links={sidebarLinks} collapsed={false} />
                    </SheetContent>
                  </Sheet>
                </div>

                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="hidden lg:flex p-1.5 rounded-md hover:bg-muted transition-colors duration-280"
                  aria-label={collapsed ? 'Perluas sidebar' : 'Kecilkan sidebar'}
                  id="cms-collapse-toggle"
                >
                  <ChevronLeft className={cn('w-4 h-4 transition-transform duration-300', collapsed && 'rotate-180')} />
                </button>

                <div>
                  <h1 className="text-lg font-semibold text-foreground leading-tight">{title}</h1>
                  {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </div>
              </div>
            </div>
          </header>
        )}

        <main className={cn('flex-1 p-4 lg:p-8', mainClassName)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={title}
              className={contentClassName}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
