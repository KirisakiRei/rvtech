import { useEffect, useState } from 'react'
import { ArrowLeft, CreditCard, Loader2, QrCode, TicketPercent } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ErrorNotice } from '@/components/feedback/ErrorNotice'
import { CMS_SIDEBAR_LINKS, formatRupiah } from '@/lib/constants'
import { sapatamuApplyVoucher, sapatamuCreatePayment, sapatamuGetCart } from '@/lib/api'
import type { SapatamuCartData } from '@/types/sapatamu'

const PAYMENT_METHODS = [
  { id: 'qris', label: 'QRIS', description: 'Tampilkan QR string mock bergaya QRIS Pakasir.', icon: QrCode },
  { id: 'bni_va', label: 'BNI Virtual Account', description: 'Nomor VA mock untuk simulasi pembayaran transfer bank.', icon: CreditCard },
  { id: 'bri_va', label: 'BRI Virtual Account', description: 'Nomor VA mock untuk simulasi pembayaran transfer bank.', icon: CreditCard },
] as const

export function CmsSapatamuCheckout() {
  const navigate = useNavigate()
  const { invitationId = '' } = useParams<{ invitationId: string }>()
  const [cart, setCart] = useState<SapatamuCartData | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<(typeof PAYMENT_METHODS)[number]['id']>('qris')
  const [voucherCode, setVoucherCode] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await sapatamuGetCart<SapatamuCartData>(invitationId)
        const nextCart = response.data ?? null
        setCart(nextCart)
        setVoucherCode(nextCart?.voucher?.code ?? '')
      } catch {
        setError('Data checkout belum bisa dimuat.')
      } finally {
        setIsLoading(false)
      }
    }

    void run()
  }, [invitationId])

  return (
    <CmsLayout
      sidebarLinks={CMS_SIDEBAR_LINKS.general}
      title="Checkout"
      subtitle="Pilih metode pembayaran yang didukung flow mock Pakasir."
    >
      <div className="space-y-6">
        <Button variant="ghost" className="px-0 text-muted-foreground hover:bg-transparent" onClick={() => navigate(`/cms/sapatamu/${invitationId}/cart`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke keranjang
        </Button>

        {error && <ErrorNotice message={error} />}

        {isLoading ? (
          <div className="rounded-[1.6rem] border border-border bg-card p-6 text-sm text-muted-foreground">
            Memuat checkout...
          </div>
        ) : cart?.item ? (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
            <div className="rounded-[1.7rem] border border-border bg-card p-6 space-y-5">
              <div>
                <p className="text-sm text-muted-foreground">Pilih metode pembayaran</p>
                <h2 className="text-2xl font-semibold text-foreground mt-1">Selesaikan aktivasi untuk {cart.item.packageName}</h2>
              </div>

              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full rounded-[1.4rem] border p-4 text-left transition-colors ${
                      selectedMethod === method.id ? 'border-accent bg-accent/5' : 'border-border bg-background'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                          <method.icon className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{method.label}</p>
                          <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                        </div>
                      </div>
                      {selectedMethod === method.id && <Badge className="border-0 bg-accent/10 text-accent">Dipilih</Badge>}
                    </div>
                  </button>
                ))}
              </div>

            </div>

            <div className="rounded-[1.7rem] border border-border bg-card p-6 space-y-4 h-fit">
              <p className="font-semibold text-foreground">Ringkasan Pembayaran</p>
              <SummaryRow label="Paket" value={cart.item.packageName} />
              <SummaryRow label="Subtotal" value={formatRupiah(cart.originalAmount)} />
              <SummaryRow label="Metode" value={PAYMENT_METHODS.find((item) => item.id === selectedMethod)?.label ?? '-'} />
              <div className="rounded-2xl border border-border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <TicketPercent className="w-4 h-4 text-accent" />
                  <p className="font-medium text-foreground">Voucher</p>
                </div>
                <div className="flex items-center gap-3">
                  <Input value={voucherCode} onChange={(event) => setVoucherCode(event.target.value.toUpperCase())} placeholder="Contoh: REKAVIA10" className="h-11 rounded-xl" />
                  <Button
                    variant="outline"
                    disabled={!voucherCode || isSubmitting}
                    onClick={() => {
                      setIsSubmitting(true)
                      setError(null)
                      void sapatamuApplyVoucher<SapatamuCartData>(invitationId, voucherCode)
                        .then((response) => {
                          const nextCart = response.data ?? null
                          setCart(nextCart)
                          setVoucherCode(nextCart?.voucher?.code ?? '')
                        })
                        .catch(() => setError('Voucher tidak valid atau belum bisa diterapkan.'))
                        .finally(() => setIsSubmitting(false))
                    }}
                  >
                    Apply
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Voucher yang aktif akan langsung masuk ke total pembayaran.</p>
              </div>
              <SummaryRow label="Voucher" value={cart.discountAmount ? `- ${formatRupiah(cart.discountAmount)}` : '-'} />
              <div className="pt-2 border-t border-border flex items-center justify-between gap-4">
                <p className="font-semibold text-foreground">Total</p>
                <p className="text-xl font-semibold text-foreground">{formatRupiah(cart.totalAmount)}</p>
              </div>
              <Button
                className="w-full"
                disabled={isSubmitting}
                onClick={() => {
                  setIsSubmitting(true)
                  void sapatamuCreatePayment<{ orderId: string; nextPath: string }>(invitationId, selectedMethod)
                    .then((response) => navigate(response.data?.nextPath ?? `/cms/payments/${response.data?.orderId}`))
                    .catch(() => setError('Pembayaran belum bisa dibuat.'))
                    .finally(() => setIsSubmitting(false))
                }}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Selesaikan Pembayaran
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.6rem] border border-dashed border-border bg-card p-8">
            <p className="text-base font-semibold text-foreground">Belum ada item di checkout.</p>
            <p className="text-sm text-muted-foreground mt-2">Pilih paket terlebih dahulu dari halaman aktivasi atau keranjang.</p>
          </div>
        )}
      </div>
    </CmsLayout>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  )
}
