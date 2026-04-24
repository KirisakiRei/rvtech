import { motion } from 'framer-motion'
import { Users, DollarSign, TrendingUp, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { BRAND, CMS_SIDEBAR_LINKS, formatRupiah } from '@/lib/constants'
import { mockStats, mockTenants } from '@/data/mockData'

const stats = [
  {
    label: 'Total Tenant',
    value: mockStats.totalTenants.toString(),
    change: '+12%',
    up: true,
    icon: Users,
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    label: 'Tenant Aktif',
    value: mockStats.activeTenants.toString(),
    change: '+8%',
    up: true,
    icon: TrendingUp,
    color: 'bg-success/10 text-success',
  },
  {
    label: 'Pendapatan Bulan Ini',
    value: formatRupiah(mockStats.monthlyRevenue),
    change: '+23%',
    up: true,
    icon: DollarSign,
    color: 'bg-terracotta-soft text-terracotta',
  },
  {
    label: 'Total Pendapatan',
    value: formatRupiah(mockStats.totalRevenue),
    change: '+18%',
    up: true,
    icon: Package,
    color: 'bg-warning/10 text-warning',
  },
]

const productLabels: Record<string, string> = {
  sapatamu: 'SapaTamu',
  etalasepro: 'EtalasePro',
  citrakorpora: 'CitraKorpora',
  edugerbang: 'EduGerbang',
}

export function AdminDashboard() {
  const maxRevenue = Math.max(...mockStats.revenueMonthly.map((r) => r.amount))

  return (
    <CmsLayout
      sidebarLinks={CMS_SIDEBAR_LINKS.admin}
      title="Dashboard"
      subtitle={`Ringkasan platform ${BRAND.name}`}
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-success' : 'text-destructive'}`}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-heading text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2 bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-base font-medium text-foreground mb-6">Pendapatan Bulanan</h3>
            <div className="flex items-end gap-3 h-[200px]">
              {mockStats.revenueMonthly.map((item, i) => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.amount / maxRevenue) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.4 + i * 0.08 }}
                    className="w-full bg-accent/15 hover:bg-accent/25 rounded-t-md transition-colors duration-280 relative group cursor-pointer"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatRupiah(item.amount)}
                    </div>
                  </motion.div>
                  <span className="text-[10px] text-muted-foreground">{item.month}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-base font-medium text-foreground mb-6">Produk Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(mockStats.productBreakdown).map(([key, value]) => {
                const total = Object.values(mockStats.productBreakdown).reduce((a, b) => a + b, 0)
                const pct = ((value / total) * 100).toFixed(0)
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-foreground">{productLabels[key]}</span>
                      <span className="text-xs text-muted-foreground">{value} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="h-full bg-accent rounded-full"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Basic</span>
                <span className="font-medium text-foreground">{mockStats.tierBreakdown.basic}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Pro</span>
                <span className="font-medium text-foreground">{mockStats.tierBreakdown.pro}</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="text-base font-medium text-foreground mb-4">Tenant Terbaru</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-xs label-text text-muted-foreground font-medium">Nama</th>
                  <th className="text-left py-3 px-2 text-xs label-text text-muted-foreground font-medium">Produk</th>
                  <th className="text-left py-3 px-2 text-xs label-text text-muted-foreground font-medium">Tier</th>
                  <th className="text-left py-3 px-2 text-xs label-text text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockTenants.slice(0, 5).map((tenant) => (
                  <tr key={tenant.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium text-foreground">{tenant.ownerName}</p>
                        <p className="text-xs text-muted-foreground">{tenant.domainUrl}.{BRAND.domain}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {productLabels[tenant.productCategory]}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        tenant.tier === 'pro' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
                      }`}>
                        {tenant.tier.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        tenant.status === 'active' ? 'bg-success/10 text-success' :
                        tenant.status === 'suspended' ? 'bg-destructive/10 text-destructive' :
                        'bg-warning/10 text-warning'
                      }`}>
                        {tenant.status === 'active' ? 'Aktif' : tenant.status === 'suspended' ? 'Suspended' : 'Expired'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </CmsLayout>
  )
}
