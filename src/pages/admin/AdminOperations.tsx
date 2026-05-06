import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, CircleDollarSign, Eye, FileClock, Package, Plus, Search, ShieldAlert, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { CMS_SIDEBAR_LINKS, formatRupiah } from '@/lib/constants'
import {
  adminAuditLogs,
  adminCreateSapatamuAsset,
  adminDeleteSapatamuAsset,
  adminFinanceOrders,
  adminFinancePayments,
  adminOverview,
  adminPackages,
  adminProductOverview,
  adminProducts,
  adminSapatamuAssets,
  adminSapatamuLayouts,
  adminSapatamuTemplates,
  adminSavePackage,
  adminSaveSapatamuLayout,
  adminSaveSapatamuTemplate,
  adminSaveVoucher,
  adminSetUserStatus,
  adminUpdateSapatamuAsset,
  adminUserDetail,
  adminUsers,
  adminVouchers,
  resolveApiAssetUrl,
} from '@/lib/api'
import type {
  AdminAuditLog,
  AdminEditorLayoutTemplate,
  AdminFinanceOrder,
  AdminFinancePayment,
  AdminList,
  AdminOverview,
  AdminPackage,
  AdminProductSummary,
  AdminTemplate,
  AdminTemplateAsset,
  AdminUserDetail,
  AdminUserListItem,
  AdminVoucher,
} from '@/types/admin'

const PRODUCT_LABELS: Record<string, string> = {
  sapatamu: 'Sapatamu',
  etalasepro: 'EtalasePro',
  citrakorpora: 'CitraKorpora',
  edugerbang: 'EduGerbang',
}

function numberValue(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

type AssetMetadataFormState = {
  enabled: boolean
  slot: string
  animationStyle: string
  animationDuration: string
  opacity: string
  blendMode: string
  gradientFrom: string
  gradientTo: string
  loop: boolean
  title: string
  label: string
  width: string
  height: string
}

const EMPTY_ASSET_METADATA_FORM: AssetMetadataFormState = {
  enabled: true,
  slot: '',
  animationStyle: '',
  animationDuration: '',
  opacity: '',
  blendMode: '',
  gradientFrom: '',
  gradientTo: '',
  loop: false,
  title: '',
  label: '',
  width: '',
  height: '',
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function assetMetadataToForm(metadata: Record<string, unknown> | null | undefined): AssetMetadataFormState {
  const source = objectValue(metadata)
  const animation = objectValue(source.animation)
  const blend = objectValue(source.blend)
  const gradient = objectValue(source.gradient)

  return {
    enabled: typeof source.enabled === 'boolean' ? source.enabled : true,
    slot: stringValue(source.slot),
    animationStyle: typeof animation.style === 'number' || typeof animation.style === 'string' ? String(animation.style) : '',
    animationDuration: typeof animation.duration === 'number' || typeof animation.duration === 'string' ? String(animation.duration) : '',
    opacity: typeof source.opacity === 'number' || typeof source.opacity === 'string' ? String(source.opacity) : '',
    blendMode: stringValue(blend.mode),
    gradientFrom: stringValue(gradient.from),
    gradientTo: stringValue(gradient.to),
    loop: typeof source.loop === 'boolean' ? source.loop : false,
    title: stringValue(source.title),
    label: stringValue(source.label),
    width: typeof source.width === 'number' || typeof source.width === 'string' ? String(source.width) : '',
    height: typeof source.height === 'number' || typeof source.height === 'string' ? String(source.height) : '',
  }
}

function numberOrUndefined(value: string): number | undefined {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function buildAssetMetadataFromForm(
  form: AssetMetadataFormState,
  existing?: Record<string, unknown> | null,
): Record<string, unknown> {
  const metadata: Record<string, unknown> = {
    ...objectValue(existing),
    enabled: form.enabled,
  }

  if (form.slot.trim()) metadata.slot = form.slot.trim()
  else delete metadata.slot

  const animationStyle = numberOrUndefined(form.animationStyle)
  const animationDuration = numberOrUndefined(form.animationDuration)
  if (animationStyle !== undefined || animationDuration !== undefined) {
    metadata.animation = {
      ...objectValue(metadata.animation),
      ...(animationStyle !== undefined ? { style: animationStyle } : {}),
      ...(animationDuration !== undefined ? { duration: animationDuration } : {}),
    }
  } else {
    delete metadata.animation
  }

  const opacity = numberOrUndefined(form.opacity)
  if (opacity !== undefined) metadata.opacity = opacity
  else delete metadata.opacity

  if (form.blendMode.trim()) metadata.blend = { ...objectValue(metadata.blend), mode: form.blendMode.trim() }
  else delete metadata.blend

  if (form.gradientFrom.trim() || form.gradientTo.trim()) {
    metadata.gradient = {
      ...objectValue(metadata.gradient),
      ...(form.gradientFrom.trim() ? { from: form.gradientFrom.trim() } : {}),
      ...(form.gradientTo.trim() ? { to: form.gradientTo.trim() } : {}),
    }
  } else {
    delete metadata.gradient
  }

  if (form.loop) metadata.loop = true
  else delete metadata.loop

  if (form.title.trim()) metadata.title = form.title.trim()
  else delete metadata.title

  if (form.label.trim()) metadata.label = form.label.trim()
  else delete metadata.label

  const width = numberOrUndefined(form.width)
  const height = numberOrUndefined(form.height)
  if (width !== undefined) metadata.width = width
  else delete metadata.width
  if (height !== undefined) metadata.height = height
  else delete metadata.height

  return metadata
}

function dateLabel(value: string | null | undefined) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function statusBadge(status: string | boolean | null | undefined) {
  const value = typeof status === 'boolean' ? (status ? 'active' : 'inactive') : status ?? 'unknown'
  const good = ['active', 'paid', 'published'].includes(value)
  const warn = ['pending', 'draft', 'coming_soon'].includes(value)
  return (
    <Badge variant={good ? 'default' : warn ? 'secondary' : value === 'suspended' || value === 'failed' ? 'destructive' : 'outline'}>
      {value}
    </Badge>
  )
}

function AdminShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <CmsLayout sidebarLinks={CMS_SIDEBAR_LINKS.admin} title={title} subtitle={subtitle}>
      {children}
    </CmsLayout>
  )
}

function LoadingState() {
  return <div className="rounded-2xl border border-dashed border-border p-8 text-sm text-muted-foreground">Memuat data admin...</div>
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-border p-8 text-sm text-muted-foreground">{label}</div>
}

function AssetMetadataFields({
  value,
  onChange,
}: {
  value: AssetMetadataFormState
  onChange: (next: AssetMetadataFormState) => void
}) {
  const update = <K extends keyof AssetMetadataFormState>(key: K, nextValue: AssetMetadataFormState[K]) => {
    onChange({ ...value, [key]: nextValue })
  }

  return (
    <div className="rounded-xl border border-border/80 bg-background/60 p-3">
      <div className="grid gap-2 md:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-muted-foreground md:col-span-2">
          <input type="checkbox" checked={value.enabled} onChange={(event) => update('enabled', event.target.checked)} />
          Asset aktif dalam template
        </label>
        <select className="h-10 rounded-xl border border-border bg-background px-3 text-sm" value={value.slot} onChange={(event) => update('slot', event.target.value)}>
          {['', 'cover', 'global', 'opening', 'salam', 'quote', 'top_left', 'top_right', 'middle_left', 'middle_right', 'bottom_left', 'bottom_right', 'profile_photo', 'gallery', 'thanks'].map((slot) => (
            <option key={slot} value={slot}>{slot || 'slot'}</option>
          ))}
        </select>
        <Input placeholder="title, contoh: Munggah Sriwijaya" value={value.title} onChange={(event) => update('title', event.target.value)} />
        <Input placeholder="label internal" value={value.label} onChange={(event) => update('label', event.target.value)} />
        <Input placeholder="opacity 0-1" type="number" step="0.05" min="0" max="1" value={value.opacity} onChange={(event) => update('opacity', event.target.value)} />
        <select className="h-10 rounded-xl border border-border bg-background px-3 text-sm" value={value.animationStyle} onChange={(event) => update('animationStyle', event.target.value)}>
          {[
            ['', 'animasi masuk'],
            ['5', 'Rise Up'],
            ['6', 'Rise Left'],
            ['7', 'Rise Right'],
            ['8', 'Rise Down'],
            ['9', 'Zoom In'],
            ['10', 'Zoom Out'],
            ['14', 'Pulse'],
            ['16', 'Pop'],
            ['17', 'Wiggle'],
          ].map(([code, label]) => <option key={code} value={code}>{label}</option>)}
        </select>
        <Input placeholder="durasi animasi, detik" type="number" step="0.1" min="0" value={value.animationDuration} onChange={(event) => update('animationDuration', event.target.value)} />
        <select className="h-10 rounded-xl border border-border bg-background px-3 text-sm" value={value.blendMode} onChange={(event) => update('blendMode', event.target.value)}>
          {['', 'normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light'].map((mode) => <option key={mode} value={mode}>{mode || 'blend mode'}</option>)}
        </select>
        <Input placeholder="gradient from, contoh #4a1a1f" value={value.gradientFrom} onChange={(event) => update('gradientFrom', event.target.value)} />
        <Input placeholder="gradient to, contoh #341215" value={value.gradientTo} onChange={(event) => update('gradientTo', event.target.value)} />
        <Input placeholder="width px" type="number" min="0" value={value.width} onChange={(event) => update('width', event.target.value)} />
        <Input placeholder="height px" type="number" min="0" value={value.height} onChange={(event) => update('height', event.target.value)} />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={value.loop} onChange={(event) => update('loop', event.target.checked)} />
          Loop video/audio
        </label>
      </div>
    </div>
  )
}

function StatStrip({ stats }: { stats: Array<{ label: string; value: string; icon?: React.ElementType }> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item, index) => {
        const Icon = item.icon ?? CheckCircle2
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Icon className="size-4" />
            </div>
            <p className="text-2xl font-semibold text-foreground">{item.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
          </motion.div>
        )
      })}
    </div>
  )
}

function SearchBar({ value, onChange, placeholder = 'Cari data...' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 rounded-xl pl-9" />
    </div>
  )
}

export function AdminDashboard() {
  const [overview, setOverview] = useState<AdminOverview | null>(null)

  useEffect(() => {
    void adminOverview<AdminOverview>().then((response) => setOverview(response.data ?? null))
  }, [])

  return (
    <AdminShell title="Admin Dashboard" subtitle="Monitoring operasional platform Rekavia">
      {!overview ? (
        <LoadingState />
      ) : (
        <div className="space-y-8">
          <StatStrip
            stats={[
              { label: 'Revenue paid', value: formatRupiah(overview.kpis.revenue), icon: CircleDollarSign },
              { label: 'Active users', value: String(overview.kpis.activeUsers), icon: Users },
              { label: 'Published invitation', value: String(overview.kpis.publishedInvitations), icon: Eye },
              { label: 'Checkout conversion', value: `${overview.kpis.conversionRate}%`, icon: CheckCircle2 },
            ]}
          />

          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Product operations</h2>
                <p className="text-sm text-muted-foreground">Pilih produk untuk mengatur template, tier, dan konfigurasi operasional.</p>
              </div>
              <Button variant="outline" render={<Link to="/admin/products" />}>Lihat semua produk</Button>
            </div>
            <div className="grid gap-4 lg:grid-cols-4">
              {overview.products.map((product) => (
                <Link
                  key={product.code}
                  to={`/admin/products/${product.code}`}
                  className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{product.code}</p>
                      <h3 className="mt-2 text-xl font-semibold">{product.name}</h3>
                    </div>
                    {statusBadge(product.status)}
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-muted-foreground">Template</p><p className="font-semibold">{product.templates}</p></div>
                    <div><p className="text-muted-foreground">Revenue</p><p className="font-semibold">{formatRupiah(product.revenue)}</p></div>
                  </div>
                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-accent">
                    Manage <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-5">
              <h2 className="font-semibold">Template terlaris</h2>
              <p className="text-sm text-muted-foreground">Diurutkan dari jumlah invitation yang memakai template tersebut.</p>
            </div>
            <div className="divide-y divide-border">
              {overview.topTemplates.length === 0 ? <EmptyState label="Belum ada template usage." /> : overview.topTemplates.map((item) => (
                <div key={item.templateId} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.productCode} / {item.code}</p>
                  </div>
                  <Badge variant="outline">{item.invitations} invitation</Badge>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  )
}

export function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [data, setData] = useState<AdminList<AdminUserListItem> | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void adminUsers<AdminList<AdminUserListItem>>({ search, limit: 50 }).then((response) => setData(response.data ?? null))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [search])

  return (
    <AdminShell title="Users" subtitle="Manajemen akun, status, revenue, dan invitation user">
      <div className="space-y-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Cari nama, email, atau username..." />
        {!data ? <LoadingState /> : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Invitation</th>
                  <th className="p-3">Revenue</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((user) => (
                  <tr key={user.id} className="border-t border-border">
                    <td className="p-3"><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></td>
                    <td className="p-3">{statusBadge(user.status)}</td>
                    <td className="p-3">{user.totalInvitations}</td>
                    <td className="p-3">{formatRupiah(user.totalRevenue)}</td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant="outline" render={<Link to={`/admin/users/${user.id}`} />}>Detail</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  )
}

export function AdminUserDetailPage() {
  const { userId = '' } = useParams()
  const [detail, setDetail] = useState<AdminUserDetail | null>(null)

  const reload = () => void adminUserDetail<AdminUserDetail>(userId).then((response) => setDetail(response.data ?? null))
  useEffect(reload, [userId])

  return (
    <AdminShell title="User Detail" subtitle="Profil, order, license, dan invitation milik user">
      {!detail ? <LoadingState /> : (
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{detail.profile.name}</h2>
                <p className="text-sm text-muted-foreground">{detail.profile.email}</p>
                <div className="mt-3 flex gap-2">{statusBadge(detail.profile.status)}{statusBadge(detail.profile.role)}</div>
              </div>
              <Button
                variant={detail.profile.status === 'active' ? 'destructive' : 'default'}
                onClick={() => {
                  void adminSetUserStatus(userId, detail.profile.status === 'active' ? 'suspended' : 'active').then(reload)
                }}
              >
                {detail.profile.status === 'active' ? 'Suspend user' : 'Aktifkan user'}
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-5">
              <h3 className="font-semibold">Invitations</h3>
            </div>
            <div className="divide-y divide-border">
              {detail.invitations.map((invitation) => (
                <div key={invitation.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{invitation.title}</p>
                    <p className="text-xs text-muted-foreground">{invitation.slug ?? invitation.id} / {invitation.views} views / {invitation.rsvps} RSVP</p>
                  </div>
                  <div className="flex gap-2">
                    {statusBadge(invitation.status)}
                    <Button size="sm" variant="outline" render={<Link to={invitation.editorUrl} />}>Open editor</Button>
                    <Button size="sm" variant="outline" render={<Link to={invitation.manageUrl} />}>Manage</Button>
                  </div>
                </div>
              ))}
              {detail.invitations.length === 0 && <EmptyState label="User belum punya invitation." />}
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  )
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProductSummary[] | null>(null)
  useEffect(() => {
    void adminProducts<AdminProductSummary[]>().then((response) => setProducts(response.data ?? []))
  }, [])
  return (
    <AdminShell title="Products" subtitle="Pilih produk untuk konfigurasi detail">
      {!products ? <LoadingState /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <Link key={product.code} to={`/admin/products/${product.code}`} className="rounded-2xl border border-border bg-card p-5 transition hover:border-accent/40">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold">{product.name}</h2>
                {statusBadge(product.status)}
              </div>
              <p className="mt-2 min-h-10 text-sm text-muted-foreground">{product.description}</p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
                <span>{product.templates} template</span>
                <span>{product.packages} tier</span>
                <span>{product.invitations} user</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AdminShell>
  )
}

export function AdminProductDetailPage() {
  const { productCode = 'sapatamu' } = useParams()
  const [overview, setOverview] = useState<any>(null)

  useEffect(() => {
    void adminProductOverview(productCode).then((response) => setOverview(response.data ?? null))
  }, [productCode])

  const isSapatamu = productCode === 'sapatamu'
  return (
    <AdminShell title={`${PRODUCT_LABELS[productCode] ?? productCode} Management`} subtitle="Konfigurasi produk dan operasional layanan">
      {!overview ? <LoadingState /> : (
        <div className="space-y-6">
          <StatStrip
            stats={[
              { label: 'Revenue', value: formatRupiah(numberValue(overview.revenue)), icon: CircleDollarSign },
              { label: 'Invitation', value: String(overview.invitations), icon: Eye },
              { label: 'Templates', value: String(overview.templates), icon: Package },
              { label: 'Orders', value: String(overview.orders), icon: FileClock },
            ]}
          />
          {!isSapatamu ? (
            <EmptyState label="Produk ini sudah terdaftar di admin shell, tetapi konfigurasi detail baru dibuka setelah Sapatamu stabil." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                ['Theme / Template', '/admin/products/sapatamu/templates', 'Atur metadata tema, preview, dan asset per template.'],
                ['Layout Catalog', '/admin/products/sapatamu/layouts', 'Atur add-on layout yang muncul di editor.'],
                ['Package / Tier', '/admin/products/sapatamu/packages', 'Atur basic, upgrade, add-on, dan feature JSON.'],
                ['Finance', '/admin/finance?productCode=sapatamu', 'Pantau order dan payment Sapatamu.'],
                ['Vouchers', '/admin/vouchers?productCode=sapatamu', 'Kelola kode voucher untuk checkout.'],
                ['Users', '/admin/users', 'Lihat owner invitation dan aktivitasnya.'],
              ].map(([title, href, desc]) => (
                <Link key={href} to={href} className="rounded-2xl border border-border bg-card p-5 transition hover:border-accent/40">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                  <div className="mt-4 text-sm font-medium text-accent">Buka modul</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminShell>
  )
}

function TemplateForm({ onSaved }: { onSaved: () => void }) {
  const [payload, setPayload] = useState({ code: '', name: '', category: '', previewImageUrl: '', description: '', tierCategory: 'basic' })
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold">Tambah template Sapatamu</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Input placeholder="code" value={payload.code} onChange={(e) => setPayload({ ...payload, code: e.target.value })} />
        <Input placeholder="name" value={payload.name} onChange={(e) => setPayload({ ...payload, name: e.target.value })} />
        <Input placeholder="category" value={payload.category} onChange={(e) => setPayload({ ...payload, category: e.target.value })} />
        <Input placeholder="preview image URL" value={payload.previewImageUrl} onChange={(e) => setPayload({ ...payload, previewImageUrl: e.target.value })} />
        <Input placeholder="tier category" value={payload.tierCategory} onChange={(e) => setPayload({ ...payload, tierCategory: e.target.value })} />
        <Button onClick={() => void adminSaveSapatamuTemplate({ ...payload, metadata: { tierCategory: payload.tierCategory, group: payload.category } }).then(onSaved)}>
          <Plus className="size-4" /> Simpan template
        </Button>
      </div>
    </div>
  )
}

function TemplateAssetRow({
  asset,
  onSaved,
  onDeleted,
}: {
  asset: AdminTemplateAsset
  onSaved: () => void
  onDeleted: () => void
}) {
  const [details, setDetails] = useState({
    url: asset.url,
    sortOrder: String(asset.sort_order ?? 0),
    isActive: asset.is_active,
  })
  const [metadata, setMetadata] = useState(assetMetadataToForm(asset.metadata))

  useEffect(() => {
    setDetails({
      url: asset.url,
      sortOrder: String(asset.sort_order ?? 0),
      isActive: asset.is_active,
    })
    setMetadata(assetMetadataToForm(asset.metadata))
  }, [asset])

  const save = () => {
    void adminUpdateSapatamuAsset(asset.id, {
      url: details.url,
      sortOrder: Number(details.sortOrder || 0),
      isActive: details.isActive,
      metadata: buildAssetMetadataFromForm(metadata, asset.metadata),
    }).then(onSaved)
  }

  return (
    <div className="space-y-3 py-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{asset.asset_key}</p>
          <p className="text-xs text-muted-foreground">{asset.asset_type} / sort {asset.sort_order}</p>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge(asset.is_active)}
          <Button size="sm" variant="destructive" onClick={() => void adminDeleteSapatamuAsset(asset.id).then(onDeleted)}>
            Hapus
          </Button>
        </div>
      </div>
      {asset.url ? (
        <div className="overflow-hidden rounded-xl border border-border bg-muted">
          {asset.asset_type === 'video' ? (
            <video src={resolveApiAssetUrl(asset.url)} className="h-32 w-full object-cover" muted playsInline loop />
          ) : asset.asset_type === 'music' ? (
            <div className="p-3">
              <audio src={resolveApiAssetUrl(asset.url)} controls className="w-full" />
            </div>
          ) : (
            <img src={resolveApiAssetUrl(asset.url)} alt={asset.asset_key} className="h-32 w-full object-cover" />
          )}
        </div>
      ) : null}
      <Input placeholder="asset URL" value={details.url} onChange={(event) => setDetails({ ...details, url: event.target.value })} />
      <div className="grid gap-2 md:grid-cols-2">
        <Input placeholder="sort order" type="number" value={details.sortOrder} onChange={(event) => setDetails({ ...details, sortOrder: event.target.value })} />
        <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm text-muted-foreground">
          <input type="checkbox" checked={details.isActive} onChange={(event) => setDetails({ ...details, isActive: event.target.checked })} />
          Aktif di template
        </label>
      </div>
      <AssetMetadataFields value={metadata} onChange={setMetadata} />
      <Button size="sm" variant="outline" onClick={save}>
        Simpan asset
      </Button>
    </div>
  )
}

export function AdminSapatamuTemplatesPage() {
  const [data, setData] = useState<AdminList<AdminTemplate> | null>(null)
  const [selected, setSelected] = useState<AdminTemplate | null>(null)
  const [assets, setAssets] = useState<AdminTemplateAsset[]>([])
  const [assetPayload, setAssetPayload] = useState({
    assetType: 'background',
    assetKey: '',
    url: '',
    sortOrder: '0',
    metadata: EMPTY_ASSET_METADATA_FORM,
    isActive: true,
  })

  const reload = () => void adminSapatamuTemplates<AdminList<AdminTemplate>>({ limit: 100 }).then((response) => setData(response.data ?? null))
  const setAssetList = (items: AdminTemplateAsset[]) => {
    setAssets(items)
  }
  const reloadAssets = (templateId: string) =>
    adminSapatamuAssets<AdminTemplateAsset[]>(templateId).then((response) => setAssetList(response.data ?? []))
  const createAsset = () => {
    if (!selected) return
    void adminCreateSapatamuAsset(selected.id, {
      assetType: assetPayload.assetType,
      assetKey: assetPayload.assetKey,
      url: assetPayload.url,
      sortOrder: Number(assetPayload.sortOrder || 0),
      isActive: assetPayload.isActive,
      metadata: buildAssetMetadataFromForm(assetPayload.metadata),
    }).then(() => reloadAssets(selected.id))
  }
  useEffect(reload, [])
  useEffect(() => {
    if (!selected) return
    void reloadAssets(selected.id)
  }, [selected])

  return (
    <AdminShell title="Sapatamu Templates" subtitle="Theme metadata dan asset library untuk editor user">
      <div className="space-y-5">
        <TemplateForm onSaved={reload} />
        {!data ? <LoadingState /> : (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-4 md:grid-cols-2">
              {data.items.map((template) => (
                <div key={template.id} className="overflow-hidden rounded-2xl border border-border bg-card text-left transition hover:border-accent/40">
                  <div className="h-36 bg-muted">
                    {template.preview_image_url ? <img src={resolveApiAssetUrl(template.preview_image_url)} className="size-full object-cover" /> : null}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div><p className="font-semibold">{template.name}</p><p className="text-xs text-muted-foreground">{template.code}</p></div>
                      {statusBadge(template.is_active)}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{template.category ?? 'Tanpa kategori'}</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setSelected(template)}>
                        Asset
                      </Button>
                      <Link
                        to={`/admin/products/sapatamu/templates/${template.id}/editor`}
                        className="inline-flex h-7 items-center justify-center rounded-xl bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground transition hover:bg-primary/90"
                      >
                        Edit Default
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              {!selected ? <p className="text-sm text-muted-foreground">Pilih template untuk mengatur asset.</p> : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{selected.name} assets</h3>
                    <p className="text-sm text-muted-foreground">Background, ornament, frame, font, music, layout preview.</p>
                  </div>
                  <div className="grid gap-2">
                    <select className="h-10 rounded-xl border border-border bg-background px-3 text-sm" value={assetPayload.assetType} onChange={(e) => setAssetPayload({ ...assetPayload, assetType: e.target.value })}>
                      {['preview', 'background', 'ornament', 'frame', 'font', 'music', 'layout_preview', 'video', 'icon'].map((type) => <option key={type}>{type}</option>)}
                    </select>
                    <Input placeholder="asset key, contoh: desktop-background" value={assetPayload.assetKey} onChange={(e) => setAssetPayload({ ...assetPayload, assetKey: e.target.value })} />
                    <Input placeholder="asset URL" value={assetPayload.url} onChange={(e) => setAssetPayload({ ...assetPayload, url: e.target.value })} />
                    <Input placeholder="sort order" type="number" value={assetPayload.sortOrder} onChange={(e) => setAssetPayload({ ...assetPayload, sortOrder: e.target.value })} />
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" checked={assetPayload.isActive} onChange={(e) => setAssetPayload({ ...assetPayload, isActive: e.target.checked })} />
                      Aktif
                    </label>
                    <AssetMetadataFields
                      value={assetPayload.metadata}
                      onChange={(metadata) => setAssetPayload({ ...assetPayload, metadata })}
                    />
                    <Button onClick={createAsset}>
                      Tambah asset
                    </Button>
                  </div>
                  <div className="divide-y divide-border">
                    {assets.map((asset) => (
                      <TemplateAssetRow
                        key={asset.id}
                        asset={asset}
                        onSaved={() => selected ? reloadAssets(selected.id) : undefined}
                        onDeleted={() => setAssets((prev) => prev.filter((item) => item.id !== asset.id))}
                      />
                    ))}
                    {/*
                          <div><p className="text-sm font-medium">{asset.asset_key}</p><p className="text-xs text-muted-foreground">{asset.asset_type} · sort {asset.sort_order}</p></div>
                          <Button size="sm" variant="destructive" onClick={() => void adminDeleteSapatamuAsset(asset.id).then(() => setAssets((prev) => prev.filter((item) => item.id !== asset.id)))}>
                            Hapus
                          </Button>
                        </div>
                        <p className="break-all text-xs text-muted-foreground">{asset.url}</p>
                        <textarea
                          className="min-h-28 w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:border-accent"
                          value={assetMetadataDrafts[asset.id] ?? '{}'}
                          onChange={(e) => setAssetMetadataDrafts((prev) => ({ ...prev, [asset.id]: e.target.value }))}
                        />
                        <Button size="sm" variant="outline" onClick={() => saveAssetMetadata(asset)}>
                          Simpan metadata JSON
                        </Button>
                      </div>
                    */}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}

export function AdminSapatamuLayoutsPage() {
  const [data, setData] = useState<AdminList<AdminEditorLayoutTemplate> | null>(null)
  const [payload, setPayload] = useState({ layoutCode: '', family: '', title: '', previewImageUrl: '', maxInstances: '1' })
  const reload = () => void adminSapatamuLayouts<AdminList<AdminEditorLayoutTemplate>>({ limit: 100 }).then((response) => setData(response.data ?? null))
  useEffect(reload, [])
  return (
    <AdminShell title="Sapatamu Layout Catalog" subtitle="Add-on layout yang muncul di editor user">
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="grid gap-3 md:grid-cols-6">
            <Input placeholder="layoutCode" value={payload.layoutCode} onChange={(e) => setPayload({ ...payload, layoutCode: e.target.value })} />
            <Input placeholder="family" value={payload.family} onChange={(e) => setPayload({ ...payload, family: e.target.value })} />
            <Input placeholder="title" value={payload.title} onChange={(e) => setPayload({ ...payload, title: e.target.value })} />
            <Input placeholder="preview URL" value={payload.previewImageUrl} onChange={(e) => setPayload({ ...payload, previewImageUrl: e.target.value })} />
            <Input placeholder="max" value={payload.maxInstances} onChange={(e) => setPayload({ ...payload, maxInstances: e.target.value })} />
            <Button onClick={() => void adminSaveSapatamuLayout({ ...payload, maxInstances: Number(payload.maxInstances) }).then(reload)}>Tambah layout</Button>
          </div>
        </div>
        {!data ? <LoadingState /> : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((layout) => (
              <div key={layout.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex justify-between gap-2"><p className="font-semibold">{layout.title}</p>{statusBadge(layout.is_active)}</div>
                <p className="text-xs text-muted-foreground">{layout.layout_code} / {layout.family}</p>
                <p className="mt-2 text-sm">Max {layout.max_instances ?? 1} instance</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}

export function AdminSapatamuPackagesPage() {
  const [data, setData] = useState<AdminList<AdminPackage> | null>(null)
  const [payload, setPayload] = useState({ code: '', name: '', price: '', packageType: 'base', photoQuota: '20', editAccessDays: '30' })
  const reload = () => void adminPackages<AdminList<AdminPackage>>({ productCode: 'sapatamu', limit: 100 }).then((response) => setData(response.data ?? null))
  useEffect(reload, [])
  return (
    <AdminShell title="Sapatamu Package / Tier" subtitle="Basic, upgrade, add-on, dan feature gate editor">
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="grid gap-3 md:grid-cols-6">
            <Input placeholder="code" value={payload.code} onChange={(e) => setPayload({ ...payload, code: e.target.value })} />
            <Input placeholder="name" value={payload.name} onChange={(e) => setPayload({ ...payload, name: e.target.value })} />
            <Input placeholder="price" value={payload.price} onChange={(e) => setPayload({ ...payload, price: e.target.value })} />
            <select className="h-10 rounded-xl border border-border bg-background px-3 text-sm" value={payload.packageType} onChange={(e) => setPayload({ ...payload, packageType: e.target.value })}>
              <option value="base">base</option><option value="upgrade">upgrade</option><option value="add_on">add_on</option>
            </select>
            <Input placeholder="photo quota" value={payload.photoQuota} onChange={(e) => setPayload({ ...payload, photoQuota: e.target.value })} />
            <Button onClick={() => void adminSavePackage({
              ...payload,
              price: Number(payload.price),
              featuresJson: { photoQuota: Number(payload.photoQuota), editAccessDays: Number(payload.editAccessDays), supportsMusic: true, supportsGift: true },
            }).then(reload)}>Simpan tier</Button>
          </div>
        </div>
        {!data ? <LoadingState /> : <PackageGrid packages={data.items} />}
      </div>
    </AdminShell>
  )
}

function PackageGrid({ packages }: { packages: AdminPackage[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {packages.map((pkg) => (
        <div key={pkg.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex justify-between gap-3"><h3 className="font-semibold">{pkg.name}</h3>{statusBadge(pkg.is_active)}</div>
          <p className="mt-1 text-xs text-muted-foreground">{pkg.code} / {pkg.package_type}</p>
          <p className="mt-4 text-2xl font-semibold">{formatRupiah(numberValue(pkg.price))}</p>
          <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-muted p-3 text-xs">{JSON.stringify(pkg.features_json ?? {}, null, 2)}</pre>
        </div>
      ))}
    </div>
  )
}

export function AdminVouchersPage() {
  const [data, setData] = useState<AdminList<AdminVoucher> | null>(null)
  const [payload, setPayload] = useState({ code: '', label: '', discountType: 'percent', discountValue: '', quotaTotal: '' })
  const reload = () => void adminVouchers<AdminList<AdminVoucher>>({ limit: 100 }).then((response) => setData(response.data ?? null))
  useEffect(reload, [])
  return (
    <AdminShell title="Vouchers" subtitle="Kelola kode diskon checkout dan quota pemakaian">
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="grid gap-3 md:grid-cols-6">
            <Input placeholder="CODE" value={payload.code} onChange={(e) => setPayload({ ...payload, code: e.target.value.toUpperCase() })} />
            <Input placeholder="label" value={payload.label} onChange={(e) => setPayload({ ...payload, label: e.target.value })} />
            <select className="h-10 rounded-xl border border-border bg-background px-3 text-sm" value={payload.discountType} onChange={(e) => setPayload({ ...payload, discountType: e.target.value })}>
              <option value="percent">percent</option><option value="fixed">fixed</option>
            </select>
            <Input placeholder="value" value={payload.discountValue} onChange={(e) => setPayload({ ...payload, discountValue: e.target.value })} />
            <Input placeholder="quota total" value={payload.quotaTotal} onChange={(e) => setPayload({ ...payload, quotaTotal: e.target.value })} />
            <Button onClick={() => void adminSaveVoucher({
              ...payload,
              discountValue: Number(payload.discountValue),
              quotaTotal: payload.quotaTotal ? Number(payload.quotaTotal) : null,
            }).then(reload)}>Tambah voucher</Button>
          </div>
        </div>
        {!data ? <LoadingState /> : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((voucher) => (
              <div key={voucher.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex justify-between gap-2"><h3 className="font-semibold">{voucher.code}</h3>{statusBadge(voucher.is_active)}</div>
                <p className="text-sm text-muted-foreground">{voucher.label}</p>
                <p className="mt-4 text-xl font-semibold">{voucher.discount_type === 'percent' ? `${numberValue(voucher.discount_value)}%` : formatRupiah(numberValue(voucher.discount_value))}</p>
                <p className="mt-2 text-xs text-muted-foreground">{voucher._count?.redemptions ?? 0} redemption / quota {voucher.quota_total ?? 'unlimited'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}

export function AdminFinancePage() {
  const [orders, setOrders] = useState<AdminList<AdminFinanceOrder> | null>(null)
  const [payments, setPayments] = useState<AdminList<AdminFinancePayment> | null>(null)
  const [status, setStatus] = useState('')
  useEffect(() => {
    void adminFinanceOrders<AdminList<AdminFinanceOrder>>({ limit: 30, status: status || undefined }).then((response) => setOrders(response.data ?? null))
    void adminFinancePayments<AdminList<AdminFinancePayment>>({ limit: 30, status: status || undefined }).then((response) => setPayments(response.data ?? null))
  }, [status])
  const paid = useMemo(() => payments?.items.filter((payment) => payment.status === 'paid').reduce((sum, payment) => sum + numberValue(payment.amount), 0) ?? 0, [payments])
  return (
    <AdminShell title="Finance" subtitle="Monitoring order, payment gateway, settlement, dan rekonsiliasi">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatStrip stats={[{ label: 'Paid amount', value: formatRupiah(paid), icon: CircleDollarSign }, { label: 'Orders loaded', value: String(orders?.items.length ?? 0), icon: FileClock }, { label: 'Payments loaded', value: String(payments?.items.length ?? 0), icon: CheckCircle2 }, { label: 'Failed/Pending filter', value: status || 'all', icon: ShieldAlert }]} />
          <select className="h-10 rounded-xl border border-border bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Semua status</option><option value="pending">pending</option><option value="paid">paid</option><option value="failed">failed</option><option value="refunded">refunded</option>
          </select>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <FinanceTable title="Orders" rows={orders?.items ?? []} kind="order" />
          <FinanceTable title="Payments" rows={payments?.items ?? []} kind="payment" />
        </div>
      </div>
    </AdminShell>
  )
}

function FinanceTable({ title, rows, kind }: { title: string; rows: Array<AdminFinanceOrder | AdminFinancePayment>; kind: 'order' | 'payment' }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border p-4"><h3 className="font-semibold">{title}</h3></div>
      <div className="divide-y divide-border">
        {rows.map((row: any) => (
          <div key={row.id} className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">{kind === 'order' ? row.checkout_token : row.provider_ref ?? row.method}</p>
              <p className="text-xs text-muted-foreground">{row.user?.email ?? row.order?.user?.email ?? row.method} / {dateLabel(row.created_at)}</p>
            </div>
            <div className="text-right">
              {statusBadge(row.status)}
              <p className="mt-1 text-sm font-semibold">{formatRupiah(numberValue(kind === 'order' ? row.total_amount : row.amount))}</p>
            </div>
          </div>
        ))}
        {rows.length === 0 && <EmptyState label="Belum ada data." />}
      </div>
    </div>
  )
}

export function AdminAuditLogsPage() {
  const [data, setData] = useState<AdminList<AdminAuditLog> | null>(null)
  useEffect(() => {
    void adminAuditLogs<AdminList<AdminAuditLog>>({ limit: 80 }).then((response) => setData(response.data ?? null))
  }, [])
  return (
    <AdminShell title="Audit Log" subtitle="Jejak perubahan penting yang dilakukan admin">
      {!data ? <LoadingState /> : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="divide-y divide-border">
            {data.items.map((log) => (
              <div key={log.id} className="grid gap-2 p-4 md:grid-cols-[1fr_auto]">
                <div><p className="font-medium">{log.action}</p><p className="text-sm text-muted-foreground">{log.entity} / {log.entity_id ?? '-'}</p></div>
                <p className="text-xs text-muted-foreground">{dateLabel(log.created_at)}</p>
              </div>
            ))}
            {data.items.length === 0 && <EmptyState label="Audit log masih kosong." />}
          </div>
        </div>
      )}
    </AdminShell>
  )
}
