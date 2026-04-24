import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CreditCard, Calendar, ArrowUpRight, Zap, Check, Heart, ShoppingBag, Building2, GraduationCap } from 'lucide-react'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CMS_SIDEBAR_LINKS, PRODUCTS, formatRupiah } from '@/lib/constants'
import { dataList } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  ShoppingBag,
  Building2,
  GraduationCap,
}

type LicenseRow = {
  id: string
  user_id: string
  template_id: string
  package_id: string
  status: 'active' | 'revoked'
  activated_at: string
  created_at: string
}

type TemplateRow = {
  id: string
  name: string
  category: 'sapatamu' | 'etalasepro' | 'citrakorpora' | 'edugerbang' | null
}

type PackageRow = {
  id: string
  code: string
  name: string
  price: number | string
}

type OrderRow = {
  id: string
  user_id: string
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled'
  total_amount: number | string
  created_at: string
}

type PaymentRow = {
  id: string
  order_id: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  amount: number | string
  created_at: string
  paid_at: string | null
}

type OrderItemRow = {
  id: string
  order_id: string
  template_id: string
  package_id: string
}

type ActiveSubscription = {
  id: string
  product: string
  productIcon: string
  tier: string
  price: number
  status: 'active' | 'revoked'
  expiresAt: string
  color: string
  cmsLink: string
}

type PaymentHistory = {
  id: string
  product: string
  amount: number
  status: string
  date: string
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  return 0
}

function resolveCmsLink(category: string | null | undefined): string {
  switch (category) {
    case 'etalasepro':
      return '/cms/etalasepro'
    case 'citrakorpora':
      return '/cms/citrakorpora'
    case 'edugerbang':
      return '/cms/edugerbang'
    default:
      return '/cms'
  }
}

export function CmsLangganan() {
  const { user } = useAuthStore()
  const [licenses, setLicenses] = useState<LicenseRow[]>([])
  const [templates, setTemplates] = useState<TemplateRow[]>([])
  const [packages, setPackages] = useState<PackageRow[]>([])
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return

    const loadSubscriptionData = async () => {
      setIsLoading(true)

      try {
        const [licenseRes, templateRes, packageRes, orderRes, paymentRes, orderItemRes] = await Promise.all([
          dataList<LicenseRow>('user-template-licenses', {
            where: { user_id: user.id },
            orderBy: { activated_at: 'desc' },
            limit: 100,
          }),
          dataList<TemplateRow>('invitation-templates', {
            orderBy: { created_at: 'desc' },
            limit: 100,
          }),
          dataList<PackageRow>('packages', {
            orderBy: { price: 'asc' },
            limit: 100,
          }),
          dataList<OrderRow>('orders', {
            where: { user_id: user.id },
            orderBy: { created_at: 'desc' },
            limit: 100,
          }),
          dataList<PaymentRow>('payments', {
            orderBy: { created_at: 'desc' },
            limit: 100,
          }),
          dataList<OrderItemRow>('order-items', {
            orderBy: { created_at: 'desc' },
            limit: 100,
          }),
        ])

        setLicenses(licenseRes.data?.items ?? [])
        setTemplates(templateRes.data?.items ?? [])
        setPackages(packageRes.data?.items ?? [])
        setOrders(orderRes.data?.items ?? [])
        setPayments(paymentRes.data?.items ?? [])
        setOrderItems(orderItemRes.data?.items ?? [])
      } catch {
        setLicenses([])
        setTemplates([])
        setPackages([])
        setOrders([])
        setPayments([])
        setOrderItems([])
      } finally {
        setIsLoading(false)
      }
    }

    void loadSubscriptionData()
  }, [user?.id])

  const activeSubscriptions = useMemo<ActiveSubscription[]>(() => {
    return licenses.map((license) => {
      const template = templates.find((item) => item.id === license.template_id)
      const currentPackage = packages.find((item) => item.id === license.package_id)
      const productMeta = PRODUCTS.find((item) => item.id === (template?.category ?? 'sapatamu')) ?? PRODUCTS[0]
      const activatedAt = license.activated_at || license.created_at
      const expiresAt = new Date(activatedAt)
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)

      return {
        id: license.id,
        product: template?.name ?? productMeta.name,
        productIcon: productMeta.icon,
        tier: currentPackage?.name ?? 'Paket Aktif',
        price: toNumber(currentPackage?.price),
        status: license.status,
        expiresAt: expiresAt.toISOString(),
        color: productMeta.color,
        cmsLink: resolveCmsLink(template?.category),
      }
    })
  }, [licenses, packages, templates])

  const paymentHistory = useMemo<PaymentHistory[]>(() => {
    return payments
      .filter((payment) => orders.some((order) => order.id === payment.order_id && order.user_id === user?.id))
      .map((payment) => {
        const order = orders.find((item) => item.id === payment.order_id)
        const orderItem = orderItems.find((item) => item.order_id === payment.order_id)
        const template = templates.find((item) => item.id === orderItem?.template_id)
        const currentPackage = packages.find((item) => item.id === orderItem?.package_id)

        return {
          id: payment.id,
          product: [template?.name, currentPackage?.name].filter(Boolean).join(' - ') || 'Pembayaran Paket',
          amount: toNumber(payment.amount || order?.total_amount),
          status: payment.status === 'paid' ? 'Berhasil' : payment.status === 'pending' ? 'Pending' : 'Gagal',
          date: payment.paid_at || payment.created_at,
        }
      })
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
  }, [orders, orderItems, packages, payments, templates, user?.id])

  const availableProducts = useMemo(() => {
    const activeCategories = new Set(
      activeSubscriptions.map((subscription) => {
        const product = PRODUCTS.find((item) => item.name === subscription.product || subscription.cmsLink.includes(item.id))
        return product?.id
      }),
    )

    return PRODUCTS.filter((product) => !activeCategories.has(product.id)).map((product) => ({
      id: product.id,
      name: product.name,
      tagline: product.tagline,
      icon: product.icon,
      color: product.color,
      startPrice: product.id === 'sapatamu' ? 150000 : product.id === 'etalasepro' ? 200000 : product.id === 'citrakorpora' ? 300000 : 250000,
    }))
  }, [activeSubscriptions])

  return (
    <CmsLayout sidebarLinks={CMS_SIDEBAR_LINKS.general} title="Langganan" subtitle="Kelola paket dan pembayaran">
      <div className="max-w-3xl space-y-8">
        <div>
          <h3 className="text-base font-medium text-foreground mb-4">Paket Aktif</h3>
          <div className="space-y-4">
            {activeSubscriptions.map((subscription, index) => {
              const Icon = iconMap[subscription.productIcon] || Heart

              return (
                <motion.div
                  key={subscription.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-5 lg:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${subscription.color}12`, color: subscription.color }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-heading text-foreground">{subscription.product}</h4>
                          <Badge className="text-[10px] border-0" style={{ backgroundColor: `${subscription.color}15`, color: subscription.color }}>
                            <Zap className="w-3 h-3 mr-0.5" />
                            {subscription.tier}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-sm font-medium text-foreground">{formatRupiah(subscription.price)}/tahun</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Berakhir{' '}
                            {new Date(subscription.expiresAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={subscription.cmsLink}>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                          <ArrowUpRight className="w-3.5 h-3.5" /> Buka CMS
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="text-xs">
                        Perpanjang
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${subscription.status === 'active' ? 'bg-success' : 'bg-destructive'}`} />
                    <span className={`text-xs font-medium ${subscription.status === 'active' ? 'text-success' : 'text-destructive'}`}>
                      {subscription.status === 'active' ? 'Aktif' : 'Dinonaktifkan'}
                    </span>
                  </div>
                </motion.div>
              )
            })}

            {!isLoading && activeSubscriptions.length === 0 && (
              <div className="bg-card border border-border rounded-xl p-6 text-sm text-muted-foreground">
                Belum ada paket aktif. Silakan pilih produk untuk mulai berlangganan.
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-foreground mb-4">Produk Lain</h3>
          <p className="text-sm text-muted-foreground mb-4">Tambahkan produk baru ke akunmu</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableProducts.map((product, index) => {
              const Icon = iconMap[product.icon] || Heart

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-5 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${product.color}12`, color: product.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{product.name}</h4>
                      <p className="text-xs text-muted-foreground">{product.tagline}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Mulai dari <span className="font-medium text-foreground">{formatRupiah(product.startPrice)}/tahun</span>
                  </p>
                  <Link to={`/produk/${product.id}`}>
                    <Button variant="outline" className="w-full text-xs gap-1.5" size="sm">
                      <Check className="w-3.5 h-3.5" /> Lihat Detail
                    </Button>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-accent" />
            <h3 className="text-base font-medium text-foreground">Riwayat Pembayaran</h3>
          </div>
          <div className="space-y-3">
            {paymentHistory.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium text-foreground">{transaction.product}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{formatRupiah(transaction.amount)}</p>
                  <p className={`text-[10px] font-medium ${transaction.status === 'Berhasil' ? 'text-success' : transaction.status === 'Pending' ? 'text-warning' : 'text-destructive'}`}>
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}

            {!isLoading && paymentHistory.length === 0 && (
              <div className="p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">Belum ada riwayat pembayaran.</div>
            )}
          </div>
        </motion.div>
      </div>
    </CmsLayout>
  )
}
