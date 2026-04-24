import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag, Eye, ArrowUpRight, TrendingUp, Box } from 'lucide-react'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Button } from '@/components/ui/button'
import { BRAND, CMS_SIDEBAR_LINKS } from '@/lib/constants'
import { useAuthStore } from '@/stores/authStore'

export function CmsEtalaseProDashboard() {
  const { user } = useAuthStore()

  const stats = [
    { label: 'Total Produk', value: '24', icon: Package, color: 'bg-success/10 text-success' },
    { label: 'Produk Aktif', value: '21', icon: Box, color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Pengunjung Bulan Ini', value: '189', icon: TrendingUp, color: 'bg-accent/10 text-accent' },
    { label: 'Klik WhatsApp', value: '47', icon: ShoppingBag, color: 'bg-warning/10 text-warning' },
  ]

  const quickActions = [
    { label: 'Kelola Produk', icon: Package, href: '/cms/etalasepro/produk', color: 'bg-success/10 text-success' },
    { label: 'Profil Toko', icon: ShoppingBag, href: '/cms/etalasepro/profil-toko', color: 'bg-accent/10 text-accent' },
  ]

  return (
    <CmsLayout sidebarLinks={CMS_SIDEBAR_LINKS.etalasepro} title={`Halo, ${user?.name || 'Pemilik Toko'}`} subtitle="Kelola toko online-mu dari sini">
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-success/5 via-card to-card border border-border rounded-2xl p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Toko Online</p>
              <h2 className="text-2xl font-heading text-foreground">toko-ratna.{BRAND.domain}</h2>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">Aktif</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">BUSINESS</span>
              </div>
            </div>
            <Link to="/toko-ratna" id="etalase-preview">
              <Button variant="outline" className="gap-2"><Eye className="w-4 h-4" /> Preview Toko</Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
              <div>
                <p className="text-xl font-heading text-foreground">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div>
          <h3 className="text-base font-medium text-foreground mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action, i) => (
              <motion.div key={action.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}>
                <Link to={action.href} className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 group">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}><action.icon className="w-5 h-5" /></div>
                  <span className="text-sm font-medium text-foreground flex-1">{action.label}</span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-medium text-foreground mb-4">Produk Terlaris</h3>
          <div className="space-y-3">
            {[
              { name: 'Kue Nastar Premium', price: 'Rp 85.000', views: 42. },
              { name: 'Rendang Daging Sapi 500g', price: 'Rp 120.000', views: 38 },
              { name: 'Sambal Matah Homemade', price: 'Rp 35.000', views: 31 },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.price}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{item.views} views</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </CmsLayout>
  )
}
