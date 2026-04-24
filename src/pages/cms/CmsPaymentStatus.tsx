import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock3, CreditCard, Loader2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ErrorNotice } from '@/components/feedback/ErrorNotice'
import { CMS_SIDEBAR_LINKS, formatRupiah } from '@/lib/constants'
import { paymentDetail, paymentMockComplete } from '@/lib/api'
import type { SapatamuPaymentDetail } from '@/types/sapatamu'

function formatCountdown(expiredAt: string | null) {
  if (!expiredAt) return '--:--'
  const diff = new Date(expiredAt).getTime() - Date.now()
  if (diff <= 0) return '00:00'
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function CmsPaymentStatus() {
  const navigate = useNavigate()
  const { orderId = '' } = useParams<{ orderId: string }>()
  const [detail, setDetail] = useState<SapatamuPaymentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(Date.now())

  useEffect(() => {
    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await paymentDetail<SapatamuPaymentDetail>(orderId)
        setDetail(response.data ?? null)
      } catch {
        setError('Status pembayaran belum bisa dimuat.')
      } finally {
        setIsLoading(false)
      }
    }

    void run()
  }, [orderId])

  useEffect(() => {
    const timer = window.setInterval(() => setTick(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const countdown = useMemo(() => formatCountdown(detail?.payment?.expiredAt ?? null), [detail?.payment?.expiredAt, tick])
  const isPaid = detail?.payment?.status === 'paid'

  return (
    <CmsLayout
      sidebarLinks={CMS_SIDEBAR_LINKS.general}
      title="Status Pembayaran"
      subtitle="Pantau status aktivasi undangan dan selesaikan simulasi pembayaran."
    >
      <div className="max-w-4xl space-y-6">
        {error && <ErrorNotice message={error} />}

        {isLoading ? (
          <div className="rounded-[1.6rem] border border-border bg-card p-6 text-sm text-muted-foreground">
            Memuat status pembayaran...
          </div>
        ) : detail ? (
          <>
            <div className={`rounded-[2rem] border p-8 ${isPaid ? 'border-accent/20 bg-accent/5' : 'border-border bg-card'}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3">
                    {isPaid ? (
                      <CheckCircle2 className="w-10 h-10 text-accent" />
                    ) : (
                      <Clock3 className="w-10 h-10 text-warning" />
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Status pembayaran</p>
                      <h2 className="text-3xl font-semibold text-foreground mt-1">
                        {isPaid ? 'Pembayaran Berhasil' : 'Menunggu Pembayaran'}
                      </h2>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Order ID: <span className="text-foreground">{detail.orderId}</span>
                  </p>
                </div>
                <Badge className={isPaid ? 'border-0 bg-accent/10 text-accent' : 'border-0 bg-warning/10 text-warning'}>
                  {detail.payment?.method?.toUpperCase() ?? 'PAYMENT'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <InfoTile label="Total" value={formatRupiah(detail.amount)} />
                <InfoTile label="Timer" value={isPaid ? 'Lunas' : countdown} />
                <InfoTile label="Voucher" value={detail.voucherCode || '-'} />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
              <div className="rounded-[1.6rem] border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-accent" />
                  <p className="font-semibold text-foreground">Detail Pembayaran</p>
                </div>

                <div className="rounded-2xl bg-muted/35 p-4">
                  <p className="text-sm font-medium text-foreground">{detail.package.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{detail.package.code}</p>
                </div>

                {detail.payment?.paymentNumber && (
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {detail.payment.method === 'qris' ? 'QRIS String' : 'Nomor Virtual Account'}
                    </p>
                    <p className="text-sm text-foreground break-all mt-3">{detail.payment.paymentNumber}</p>
                  </div>
                )}

                <div className="rounded-2xl border border-border p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Petunjuk</p>
                  {(detail.payment?.instructions ?? []).map((item, index) => (
                    <p key={index} className="text-sm text-foreground">{index + 1}. {item}</p>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-border bg-card p-6 space-y-4 h-fit">
                <p className="font-semibold text-foreground">Aksi</p>
                {!isPaid ? (
                  <Button
                    className="w-full"
                    disabled={isSubmitting}
                    onClick={() => {
                      setIsSubmitting(true)
                      void paymentMockComplete<SapatamuPaymentDetail>(orderId)
                        .then((response) => setDetail(response.data ?? null))
                        .catch(() => setError('Pembayaran mock belum bisa diselesaikan.'))
                        .finally(() => setIsSubmitting(false))
                    }}
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Simulasikan Pembayaran Berhasil
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => navigate(`/cms/sapatamu/${detail.invitationId}/send`)}>
                    Kembali ke Manage Invitation
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </CmsLayout>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background/70 border border-border px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground mt-3">{value}</p>
    </div>
  )
}
