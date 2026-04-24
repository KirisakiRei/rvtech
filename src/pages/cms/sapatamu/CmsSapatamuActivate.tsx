import { useEffect, useState } from 'react'
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ErrorNotice } from '@/components/feedback/ErrorNotice'
import { CMS_SIDEBAR_LINKS, formatRupiah } from '@/lib/constants'
import { sapatamuGetActivationOffers, sapatamuUpsertCart } from '@/lib/api'
import type { ActivationOffersData } from '@/types/sapatamu'

export function CmsSapatamuActivate() {
  const navigate = useNavigate()
  const { invitationId = '' } = useParams<{ invitationId: string }>()
  const [data, setData] = useState<ActivationOffersData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await sapatamuGetActivationOffers<ActivationOffersData>(invitationId)
        setData(response.data ?? null)
      } catch {
        setError('Pilihan paket aktivasi belum bisa dimuat.')
      } finally {
        setIsLoading(false)
      }
    }

    void run()
  }, [invitationId])

  return (
    <CmsLayout
      sidebarLinks={CMS_SIDEBAR_LINKS.general}
      title="Aktifkan Undangan"
      subtitle="Pilih paket yang sesuai dengan kategori tema invitation Anda."
    >
      <div className="space-y-6">
        <Button variant="ghost" className="px-0 text-muted-foreground hover:bg-transparent" onClick={() => navigate(`/cms/sapatamu/${invitationId}/send`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke manage invitation
        </Button>

        {error && <ErrorNotice message={error} />}

        {isLoading ? (
          <div className="rounded-[1.6rem] border border-border bg-card p-6 text-sm text-muted-foreground">
            Memuat pilihan paket...
          </div>
        ) : (
          <>
            <div className="rounded-[1.8rem] border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">Kategori minimum tema</p>
              <div className="flex items-center gap-3 flex-wrap mt-3">
                <h2 className="text-2xl font-semibold text-foreground">
                  {data?.requiredTierCategory === 'basic'
                    ? 'Basic'
                    : data?.requiredTierCategory === 'premium'
                      ? 'Premium'
                      : 'Vintage'}
                </h2>
                <Badge className="border-0 bg-warning/10 text-warning">
                  {data?.activationState === 'active' ? 'Sudah aktif' : 'Belum aktif'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Anda dapat memilih paket minimum yang sesuai kategori tema atau upgrade ke tier yang lebih tinggi jika tersedia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data?.offers.map((pkg) => (
                <div key={pkg.id} className="rounded-[1.7rem] border border-border bg-card p-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-foreground">{pkg.name}</p>
                    <Badge className="border-0 bg-muted text-foreground">{pkg.packageType}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  <p className="text-3xl font-semibold text-foreground">{formatRupiah(pkg.price)}</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Kuota foto {String(pkg.features?.photoQuota ?? '-')} foto</p>
                    <p>
                      {pkg.code === 'sapatamu-basic'
                        ? 'Masa aktif 1 tahun'
                        : 'Masa aktif selamanya'}
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setIsSubmitting(pkg.id)
                      void sapatamuUpsertCart(invitationId, { packageId: pkg.id, kind: 'activation' })
                        .then(() => navigate(`/cms/sapatamu/${invitationId}/cart`))
                        .catch(() => setError('Paket belum bisa dimasukkan ke keranjang.'))
                        .finally(() => setIsSubmitting(null))
                    }}
                    disabled={isSubmitting === pkg.id}
                  >
                    {isSubmitting === pkg.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                    Add to Cart
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </CmsLayout>
  )
}
