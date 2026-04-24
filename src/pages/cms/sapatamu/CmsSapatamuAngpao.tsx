import { motion } from 'framer-motion'
import { Lock, Wallet, CreditCard } from 'lucide-react'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CMS_SIDEBAR_LINKS, formatRupiah, PRICING } from '@/lib/constants'
import { useTenantStore } from '@/stores/tenantStore'
import { useCmsStore } from '@/stores/cmsStore'

export function CmsSapatamuAngpao() {
  const { currentTenant } = useTenantStore()
  const { weddingData, updateWeddingData } = useCmsStore()
  const isBasic = currentTenant?.tier === 'basic'
  const bankAccounts = weddingData.bankAccountInfo || []

  return (
    <CmsLayout
      sidebarLinks={CMS_SIDEBAR_LINKS.sapatamu}
      title="Digital Angpao"
      subtitle="Kelola rekening untuk amplop digital"
    >
      <div className="max-w-2xl space-y-6">
        {isBasic && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-card border border-border rounded-2xl p-8 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6">
              <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-xl font-heading text-foreground mb-2">Fitur Eksklusif Pro</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Digital Angpao hanya tersedia untuk paket Pro. Upgrade sekarang untuk menerima amplop digital dari tamu undangan.
              </p>
              <Button className="bg-accent hover:bg-terracotta-hover text-white rounded-lg px-6" id="angpao-upgrade">
                Upgrade ke Pro — {formatRupiah(PRICING.pro.price)}
              </Button>
            </div>

            <div className="opacity-30">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-4">
                <div className="h-10 bg-muted rounded-lg" />
                <div className="h-10 bg-muted rounded-lg" />
                <div className="h-10 bg-muted rounded-lg" />
              </div>
            </div>
          </motion.div>
        )}

        {!isBasic && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-r from-accent/5 to-card border border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-foreground">Digital Angpao Aktif</h3>
                  <p className="text-xs text-muted-foreground">Tamu dapat memberikan amplop digital melalui undangan</p>
                </div>
              </div>
            </motion.div>

            {bankAccounts.map((account, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <CreditCard className="w-4 h-4 text-accent" />
                  <h4 className="text-sm font-medium text-foreground">Rekening {i + 1}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`bank-name-${i}`} className="label-text text-xs">Nama Bank</Label>
                    <Input
                      id={`bank-name-${i}`}
                      value={account.bankName}
                      onChange={(e) => {
                        const updated = [...bankAccounts]
                        updated[i] = { ...updated[i], bankName: e.target.value }
                        updateWeddingData({ bankAccountInfo: updated })
                      }}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`account-name-${i}`} className="label-text text-xs">Atas Nama</Label>
                    <Input
                      id={`account-name-${i}`}
                      value={account.accountName}
                      onChange={(e) => {
                        const updated = [...bankAccounts]
                        updated[i] = { ...updated[i], accountName: e.target.value }
                        updateWeddingData({ bankAccountInfo: updated })
                      }}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`account-number-${i}`} className="label-text text-xs">Nomor Rekening</Label>
                    <Input
                      id={`account-number-${i}`}
                      value={account.accountNumber}
                      onChange={(e) => {
                        const updated = [...bankAccounts]
                        updated[i] = { ...updated[i], accountNumber: e.target.value }
                        updateWeddingData({ bankAccountInfo: updated })
                      }}
                      className="h-10 rounded-lg"
                    />
                  </div>
                </div>
              </motion.div>
            ))}

            <Button
              variant="outline"
              className="w-full h-11 rounded-lg border-dashed"
              onClick={() => {
                updateWeddingData({
                  bankAccountInfo: [...bankAccounts, { bankName: '', accountName: '', accountNumber: '' }],
                })
              }}
              id="angpao-add-account"
            >
              + Tambah Rekening
            </Button>
          </>
        )}
      </div>
    </CmsLayout>
  )
}
