import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, UserCheck, UserX, HelpCircle } from 'lucide-react'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CMS_SIDEBAR_LINKS } from '@/lib/constants'
import { dataList } from '@/lib/api'
import { useTenantStore } from '@/stores/tenantStore'

type InvitationRsvpRow = {
  id: string
  invitation_id: string
  guest_name: string
  status: 'hadir' | 'tidak' | 'ragu'
  attendees_count: number
  message: string | null
  created_at: string
}

export function CmsSapatamuRsvp() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const { currentTenant } = useTenantStore()
  const [rsvps, setRsvps] = useState<InvitationRsvpRow[]>([])

  useEffect(() => {
    if (!currentTenant?.id) {
      setRsvps([])
      return
    }

    const loadRsvps = async () => {
      try {
        const response = await dataList<InvitationRsvpRow>('invitation-rsvps', {
          where: { invitation_id: currentTenant.id },
          orderBy: { created_at: 'desc' },
          limit: 300,
        })
        setRsvps(response.data?.items ?? [])
      } catch {
        setRsvps([])
      }
    }

    void loadRsvps()
  }, [currentTenant?.id])

  const filtered = rsvps.filter((r) => {
    const matchSearch = r.guest_name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || r.status === filter
    return matchSearch && matchFilter
  })

  const hadirCount = useMemo(() => rsvps.filter((r) => r.status === 'hadir').length, [rsvps])
  const tidakCount = useMemo(() => rsvps.filter((r) => r.status === 'tidak').length, [rsvps])
  const raguCount = useMemo(() => rsvps.filter((r) => r.status === 'ragu').length, [rsvps])

  return (
    <CmsLayout
      sidebarLinks={CMS_SIDEBAR_LINKS.sapatamu}
      title="Buku Tamu"
      subtitle="Pantau RSVP dan ucapan dari tamu undangan"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: rsvps.length, icon: Users, color: 'bg-muted text-foreground' },
            { label: 'Hadir', value: hadirCount, icon: UserCheck, color: 'bg-success/10 text-success' },
            { label: 'Tidak Hadir', value: tidakCount, icon: UserX, color: 'bg-destructive/10 text-destructive' },
            { label: 'Ragu-ragu', value: raguCount, icon: HelpCircle, color: 'bg-warning/10 text-warning' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-3"
            >
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

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card border border-border rounded-xl"
        >
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama tamu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 rounded-lg"
                id="rsvp-search"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'hadir', 'tidak', 'ragu'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    filter === s ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  id={`rsvp-filter-${s}`}
                >
                  {s === 'all' ? 'Semua' : s === 'hadir' ? 'Hadir' : s === 'tidak' ? 'Tidak' : 'Ragu'}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-border/50">
            {filtered.map((rsvp, i) => (
              <motion.div
                key={rsvp.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                    rsvp.status === 'hadir' ? 'bg-success/10 text-success' :
                    rsvp.status === 'tidak' ? 'bg-destructive/10 text-destructive' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {rsvp.guest_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{rsvp.guest_name}</p>
                      <Badge className={`text-[10px] ${
                        rsvp.status === 'hadir' ? 'bg-success/10 text-success border-0' :
                        rsvp.status === 'tidak' ? 'bg-destructive/10 text-destructive border-0' :
                        'bg-warning/10 text-warning border-0'
                      }`}>
                        {rsvp.status === 'hadir' ? 'Hadir' : rsvp.status === 'tidak' ? 'Tidak Hadir' : 'Ragu-ragu'}
                      </Badge>
                      {rsvp.attendees_count > 0 && (
                        <span className="text-[10px] text-muted-foreground">{rsvp.attendees_count} tamu</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{rsvp.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {new Date(rsvp.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Belum ada RSVP yang masuk</p>
            </div>
          )}
        </motion.div>
      </div>
    </CmsLayout>
  )
}
