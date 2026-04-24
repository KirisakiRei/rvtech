import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NAV_LINKS, PRODUCTS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { BrandLogo } from '@/components/branding/BrandLogo'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileOpen(false)
  }, [location])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-background/85 backdrop-blur-xl border-b border-border shadow-sm'
            : 'bg-transparent'
        )}
      >
        <nav className="container-wide flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2 group" id="nav-logo">
            <BrandLogo compact />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.label === 'Produk' && setIsProductDropdownOpen(true)}
                onMouseLeave={() => link.label === 'Produk' && setIsProductDropdownOpen(false)}
              >
                <a
                  href={link.href}
                  className="nav-link px-4 py-2 text-foreground/70 hover:text-foreground transition-colors duration-280 flex items-center gap-1"
                  id={`nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                  {link.label === 'Produk' && (
                    <ChevronDown className={cn('w-3 h-3 transition-transform duration-280', isProductDropdownOpen && 'rotate-180')} />
                  )}
                </a>

                {link.label === 'Produk' && (
                  <AnimatePresence>
                    {isProductDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 pt-2"
                      >
                        <div className="bg-card border border-border rounded-xl shadow-lg p-2 w-[280px]">
                          {PRODUCTS.map((product) => (
                            <Link
                              key={product.id}
                              to={product.href}
                              className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors duration-280"
                              id={`nav-product-${product.id}`}
                            >
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 shrink-0"
                                style={{ backgroundColor: `${product.color}15`, color: product.color }}
                              >
                                <div className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{product.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{product.tagline}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/masuk" id="nav-login">
              <Button variant="ghost" className="nav-link text-foreground/70 hover:text-foreground">
                Masuk
              </Button>
            </Link>
            <Link to="/daftar" id="nav-register">
              <Button className="bg-accent hover:bg-terracotta-hover text-white rounded-lg px-5">
                Mulai Sekarang
              </Button>
            </Link>
          </div>

          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Buka menu navigasi"
            id="nav-mobile-toggle"
          >
            <Menu className="w-6 h-6" />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] lg:hidden"
          >
            <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative h-full flex flex-col"
            >
              <div className="flex items-center justify-between px-6 h-16">
                <BrandLogo compact />
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 text-foreground"
                  aria-label="Tutup menu"
                  id="nav-mobile-close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-center px-6 gap-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-3xl font-heading text-foreground py-3 border-b border-border/50"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {link.label}
                  </motion.a>
                ))}

                <div className="mt-8 flex flex-col gap-3">
                  <Link to="/masuk" onClick={() => setIsMobileOpen(false)}>
                    <Button variant="outline" className="w-full h-12 text-base">
                      Masuk
                    </Button>
                  </Link>
                  <Link to="/daftar" onClick={() => setIsMobileOpen(false)}>
                    <Button className="w-full h-12 text-base bg-accent hover:bg-terracotta-hover text-white">
                      Mulai Sekarang
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
