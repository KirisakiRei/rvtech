import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { GraduationCap, Megaphone, Image, BookOpen, ArrowUpRight, Eye, Users } from 'lucide-react'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Button } from '@/components/ui/button'
import { BRAND, CMS_SIDEBAR_LINKS } from '@/lib/constants'
import { useAuthStore } from '@/stores/authStore'

export function CmsEduGerbangDashboard() {
  const { user } = useAuthStore()

  const stats = [
    { label: 'Pengumuman Aktif', value: '12', icon: Megaphone, color: 'bg-warning/10 text-warning' },
    { label: 'Foto Galeri', value: '48', icon: Image, color: 'bg-accent/10 text-accent' },
    { label: 'Pengunjung Bulan Ini', value: '326', icon: Users, color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Halaman Aktif', value: '6', icon: BookOpen, color: 'bg-success/10 text-success' },
  ]

  const quickActions = [
    { label: 'Profil Sekolah', icon: GraduationCap, href: '/cms/edugerbang/profil', color: 'bg-accent/10 text-accent' },
    { label: 'Pengumuman', icon: Megaphone, href: '/cms/edugerbang/pengumuman', color: 'bg-warning/10 text-warning' },
    { label: 'Galeri Kegiatan', icon: Image, href: '/cms/edugerbang/galeri', color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Info Akademik', icon: BookOpen, href: '/cms/edugerbang/akademik', color: 'bg-success/10 text-success' },
  ]

  return (
    <CmsLayout sidebarLinks={CMS_SIDEBAR_LINKS.edugerbang} title={`Halo, ${user?.name || 'Admin Sekolah'}`} subtitle="Kelola website sekolah dari sini">
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-warning/5 via-card to-card border border-border rounded-2xl p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Website Sekolah</p>
              <h2 className="text-2xl font-heading text-foreground">sdn-ceria-1.{BRAND.domain}</h2>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">Aktif</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-warning/10 text-warning">SEKOLAH PRO</span>
              </div>
            </div>
            <Link to="/sdn-ceria-1" id="edu-preview-link">
              <Button variant="outline" className="gap-2"><Eye className="w-4 h-4" /> Preview Website</Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-heading text-foreground">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div>
          <h3 className="text-base font-medium text-foreground mb-4">Kelola Konten</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <motion.div key={action.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}>
                <Link to={action.href}
                  className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 group"
                  id={`edu-quick-${action.label.toLowerCase().replace(/\s/g, '-')}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}><action.icon className="w-5 h-5" /></div>
                  <span className="text-sm font-medium text-foreground flex-1">{action.label}</span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-foreground">Pengumuman Terbaru</h3>
            <Link to="/cms/edugerbang/pengumuman" className="text-xs text-accent hover:underline">Lihat semua</Link>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Libur Hari Raya Idul Fitri 2026', date: '20 Mar 2026', status: 'active' },
              { title: 'Pendaftaran Siswa Baru TA 2026/2027', date: '15 Mar 2026', status: 'active' },
              { title: 'Jadwal UTS Semester Genap', date: '10 Mar 2026', status: 'active' },
              { title: 'Kegiatan Class Meeting', date: '5 Mar 2026', status: 'expired' },
            ].map((item) => (
              <div key={item.title} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${item.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                  {item.status === 'active' ? 'Aktif' : 'Berakhir'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </CmsLayout>
  )
}
