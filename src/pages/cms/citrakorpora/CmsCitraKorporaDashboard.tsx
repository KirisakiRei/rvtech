import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Building2, Users, Briefcase, Eye, ArrowUpRight, Globe, FileText } from 'lucide-react'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Button } from '@/components/ui/button'
import { BRAND, CMS_SIDEBAR_LINKS } from '@/lib/constants'
import { useAuthStore } from '@/stores/authStore'

export function CmsCitraKorporaDashboard() {
  const { user } = useAuthStore()

  const stats = [
    { label: 'Halaman Aktif', value: '5', icon: FileText, color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Anggota Tim', value: '8', icon: Users, color: 'bg-accent/10 text-accent' },
    { label: 'Portofolio', value: '12', icon: Briefcase, color: 'bg-success/10 text-success' },
    { label: 'Pengunjung', value: '412', icon: Globe, color: 'bg-warning/10 text-warning' },
  ]

  const quickActions = [
    { label: 'Profil Perusahaan', icon: Building2, href: '/cms/citrakorpora/profil', color: 'bg-accent/10 text-accent' },
    { label: 'Kelola Tim', icon: Users, href: '/cms/citrakorpora/tim', color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Portofolio', icon: Briefcase, href: '/cms/citrakorpora/portofolio', color: 'bg-success/10 text-success' },
  ]

  return (
    <CmsLayout sidebarLinks={CMS_SIDEBAR_LINKS.citrakorpora} title={`Halo, ${user?.name || 'Admin'}`} subtitle="Kelola company profile perusahaan">
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-500/5 via-card to-card border border-border rounded-2xl p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Company Profile</p>
              <h2 className="text-2xl font-heading text-foreground">pt-maju-bersama.{BRAND.domain}</h2>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">Aktif</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-600">ENTERPRISE</span>
              </div>
            </div>
            <Link to="/pt-maju-bersama" id="citra-preview">
              <Button variant="outline" className="gap-2"><Eye className="w-4 h-4" /> Preview Website</Button>
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
          <h3 className="text-base font-medium text-foreground mb-4">Kelola Konten</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
      </div>
    </CmsLayout>
  )
}
