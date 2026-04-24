import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, MoreHorizontal, Eye, Ban, CheckCircle } from 'lucide-react'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BRAND, CMS_SIDEBAR_LINKS } from '@/lib/constants'
import { mockTenants } from '@/data/mockData'
import type { Tenant } from '@/types/tenant'

const productLabels: Record<string, string> = {
  sapatamu: 'SapaTamu',
  etalasepro: 'EtalasePro',
  citrakorpora: 'CitraKorpora',
  edugerbang: 'EduGerbang',
}

export function AdminTenants() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [productFilter, setProductFilter] = useState<string>('all')

  const filtered = mockTenants.filter((t: Tenant) => {
    const matchSearch =
      t.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      t.domainUrl.toLowerCase().includes(search.toLowerCase()) ||
      t.ownerEmail.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    const matchProduct = productFilter === 'all' || t.productCategory === productFilter
    return matchSearch && matchStatus && matchProduct
  })

  return (
    <CmsLayout
      sidebarLinks={CMS_SIDEBAR_LINKS.admin}
      title="Manajemen Tenant"
      subtitle={`${mockTenants.length} tenant terdaftar`}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card border border-border rounded-xl"
      >
        <div className="p-4 lg:p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari tenant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 rounded-lg"
                id="tenant-search"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground"
                id="tenant-filter-status"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
              </select>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground"
                id="tenant-filter-product"
              >
                <option value="all">Semua Produk</option>
                <option value="sapatamu">SapaTamu</option>
                <option value="etalasepro">EtalasePro</option>
                <option value="citrakorpora">CitraKorpora</option>
                <option value="edugerbang">EduGerbang</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-xs label-text text-muted-foreground font-medium">Tenant</th>
                <th className="text-left py-3 px-4 text-xs label-text text-muted-foreground font-medium hidden md:table-cell">Domain</th>
                <th className="text-left py-3 px-4 text-xs label-text text-muted-foreground font-medium">Produk</th>
                <th className="text-left py-3 px-4 text-xs label-text text-muted-foreground font-medium">Tier</th>
                <th className="text-left py-3 px-4 text-xs label-text text-muted-foreground font-medium">Status</th>
                <th className="text-left py-3 px-4 text-xs label-text text-muted-foreground font-medium hidden lg:table-cell">Dibuat</th>
                <th className="text-right py-3 px-4 text-xs label-text text-muted-foreground font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tenant, i) => (
                <motion.tr
                  key={tenant.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-foreground">{tenant.ownerName}</p>
                      <p className="text-xs text-muted-foreground">{tenant.ownerEmail}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                    <span className="text-xs bg-muted px-2 py-1 rounded">{tenant.domainUrl}.{BRAND.domain}</span>
                  </td>
                  <td className="py-3 px-4 text-foreground">
                    {productLabels[tenant.productCategory]}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={tenant.tier === 'pro' ? 'default' : 'secondary'}
                      className={tenant.tier === 'pro' ? 'bg-accent/10 text-accent border-0' : ''}
                    >
                      {tenant.tier.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      className={
                        tenant.status === 'active' ? 'bg-success/10 text-success border-0' :
                        tenant.status === 'suspended' ? 'bg-destructive/10 text-destructive border-0' :
                        'bg-warning/10 text-warning border-0'
                      }
                    >
                      {tenant.status === 'active' ? 'Aktif' : tenant.status === 'suspended' ? 'Suspended' : 'Expired'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground hidden lg:table-cell">
                    {new Date(tenant.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8" id={`tenant-action-${tenant.id}`}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Eye className="w-4 h-4" /> Lihat Detail
                        </DropdownMenuItem>
                        {tenant.status === 'active' ? (
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Ban className="w-4 h-4" /> Suspend
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="gap-2 text-success">
                            <CheckCircle className="w-4 h-4" /> Aktifkan
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Filter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Tidak ada tenant yang cocok dengan filter</p>
          </div>
        )}

        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <span>Menampilkan {filtered.length} dari {mockTenants.length} tenant</span>
        </div>
      </motion.div>
    </CmsLayout>
  )
}
