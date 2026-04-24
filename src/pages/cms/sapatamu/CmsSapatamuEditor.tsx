import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, Eye } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CMS_SIDEBAR_LINKS, WEDDING_THEMES } from '@/lib/constants'
import { useCmsStore } from '@/stores/cmsStore'
import { cn } from '@/lib/utils'
import type { WeddingThemeId } from '@/types/wedding'

const STEPS = ['Tema', 'Mempelai', 'Acara', 'Galeri & Lainnya']
function ThemePicker({ selected, onSelect }: { selected: WeddingThemeId; onSelect: (id: WeddingThemeId) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {WEDDING_THEMES.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onSelect(theme.id)}
          className={cn(
            'relative rounded-xl border-2 p-3 text-left transition-all duration-280',
            selected === theme.id
              ? 'border-accent shadow-md shadow-accent/10'
              : 'border-border hover:border-border/80'
          )}
          id={`theme-pick-${theme.id}`}
        >
          <div className="aspect-[4/3] rounded-lg mb-2 overflow-hidden" style={{ backgroundColor: theme.secondaryColor }}>
            <div className="h-full flex items-center justify-center">
              <span className="text-2xl font-heading" style={{ color: theme.primaryColor }}>
                {theme.name.charAt(0)}
              </span>
            </div>
          </div>
          <p className="text-sm font-medium text-foreground">{theme.name}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{theme.description}</p>
          {selected === theme.id && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center">
              <span className="text-xs">✓</span>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

function StepMempelai() {
  const { weddingData, updateWeddingData } = useCmsStore()
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Mempelai Pria</h4>
          <div className="space-y-2">
            <Label htmlFor="groom-name" className="label-text text-xs">Nama Lengkap</Label>
            <Input id="groom-name" value={weddingData.groomName || ''} onChange={(e) => updateWeddingData({ groomName: e.target.value })} className="h-10 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="groom-parents" className="label-text text-xs">Nama Orang Tua</Label>
            <Input id="groom-parents" value={weddingData.groomParents || ''} onChange={(e) => updateWeddingData({ groomParents: e.target.value })} placeholder="Bpk. ... & Ibu ..." className="h-10 rounded-lg" />
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Mempelai Wanita</h4>
          <div className="space-y-2">
            <Label htmlFor="bride-name" className="label-text text-xs">Nama Lengkap</Label>
            <Input id="bride-name" value={weddingData.brideName || ''} onChange={(e) => updateWeddingData({ brideName: e.target.value })} className="h-10 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bride-parents" className="label-text text-xs">Nama Orang Tua</Label>
            <Input id="bride-parents" value={weddingData.brideParents || ''} onChange={(e) => updateWeddingData({ brideParents: e.target.value })} placeholder="Bpk. ... & Ibu ..." className="h-10 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="love-story" className="label-text text-xs">Cerita Cinta (opsional)</Label>
        <Textarea id="love-story" value={weddingData.loveStory || ''} onChange={(e) => updateWeddingData({ loveStory: e.target.value })} rows={3} className="rounded-lg" placeholder="Bagaimana kalian bertemu..." />
      </div>
    </div>
  )
}

function StepAcara() {
  const { weddingData, updateWeddingData } = useCmsStore()
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Akad Nikah</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="akad-time" className="label-text text-xs">Tanggal & Waktu</Label>
            <Input id="akad-time" type="datetime-local" value={weddingData.akadTime || ''} onChange={(e) => updateWeddingData({ akadTime: e.target.value })} className="h-10 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="akad-location" className="label-text text-xs">Lokasi</Label>
            <Input id="akad-location" value={weddingData.akadLocation || ''} onChange={(e) => updateWeddingData({ akadLocation: e.target.value })} className="h-10 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Resepsi</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="resepsi-time" className="label-text text-xs">Tanggal & Waktu</Label>
            <Input id="resepsi-time" type="datetime-local" value={weddingData.resepsiTime || ''} onChange={(e) => updateWeddingData({ resepsiTime: e.target.value })} className="h-10 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resepsi-location" className="label-text text-xs">Lokasi</Label>
            <Input id="resepsi-location" value={weddingData.resepsiLocation || ''} onChange={(e) => updateWeddingData({ resepsiLocation: e.target.value })} className="h-10 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StepGallery() {
  const { weddingData, updateWeddingData, galleries } = useCmsStore()
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="bgm-url" className="label-text text-xs">URL Background Music</Label>
        <Input id="bgm-url" placeholder="https://..." value={weddingData.bgmUrl || ''} onChange={(e) => updateWeddingData({ bgmUrl: e.target.value })} className="h-10 rounded-lg" />
        <p className="text-xs text-muted-foreground">Masukkan link audio (MP3) untuk latar musik undangan</p>
      </div>
      <div>
        <Label className="label-text text-xs mb-3 block">Galeri Foto</Label>
        <div className="grid grid-cols-3 gap-3">
          {galleries.map((g) => (
            <div key={g.id} className="aspect-square rounded-lg bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground">
              Foto {g.sortOrder + 1}
            </div>
          ))}
          <button className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-accent hover:text-accent transition-colors" id="gallery-add">
            <span className="text-2xl">+</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function LivePreviewMockup() {
  const { weddingData, selectedTheme } = useCmsStore()
  const theme = WEDDING_THEMES.find((t) => t.id === selectedTheme) || WEDDING_THEMES[0]

  return (
    <div className="flex justify-center">
      <div className="w-[280px] relative">
        <div className="rounded-[2rem] border-[6px] border-foreground/10 overflow-hidden shadow-2xl bg-white">
          <div className="h-6 bg-foreground/5 flex items-center justify-center">
            <div className="w-16 h-1.5 rounded-full bg-foreground/10" />
          </div>
          <div className="h-[500px] overflow-y-auto" style={{ backgroundColor: theme.secondaryColor }}>
            <div className="p-5 text-center" style={{ color: theme.primaryColor }}>
              <p className="text-[10px] tracking-[0.15em] uppercase opacity-60 mb-3">The Wedding Of</p>
              <h3 className="text-xl" style={{ fontFamily: theme.fontHeading }}>
                {weddingData.groomName || 'Nama Pria'}
              </h3>
              <p className="text-base my-1 opacity-60">&</p>
              <h3 className="text-xl" style={{ fontFamily: theme.fontHeading }}>
                {weddingData.brideName || 'Nama Wanita'}
              </h3>

              <div className="mt-6 space-y-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${theme.primaryColor}08` }}>
                  <p className="text-[10px] tracking-[0.1em] uppercase opacity-50 mb-1">Akad Nikah</p>
                  <p className="text-xs">{weddingData.akadTime ? new Date(weddingData.akadTime).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Tanggal Akad'}</p>
                  <p className="text-[11px] opacity-60 mt-0.5">{weddingData.akadLocation || 'Lokasi Akad'}</p>
                </div>

                <div className="p-3 rounded-lg" style={{ backgroundColor: `${theme.primaryColor}08` }}>
                  <p className="text-[10px] tracking-[0.1em] uppercase opacity-50 mb-1">Resepsi</p>
                  <p className="text-xs">{weddingData.resepsiTime ? new Date(weddingData.resepsiTime).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Tanggal Resepsi'}</p>
                  <p className="text-[11px] opacity-60 mt-0.5">{weddingData.resepsiLocation || 'Lokasi Resepsi'}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="aspect-square rounded-lg" style={{ backgroundColor: `${theme.primaryColor}10` }} />
                  ))}
                </div>

                <div className="p-3 rounded-lg text-left" style={{ backgroundColor: `${theme.primaryColor}05` }}>
                  <p className="text-[10px] tracking-[0.1em] uppercase opacity-50 mb-2">Kirim Ucapan</p>
                  <div className="h-6 rounded bg-white/50 mb-2" />
                  <div className="h-12 rounded bg-white/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CmsSapatamuEditor() {
  const navigate = useNavigate()
  const { invitationId = '' } = useParams<{ invitationId: string }>()
  const { currentStep, setStep, selectedTheme, setTheme, hydrateInvitation, saveInvitation, isLoading } = useCmsStore()
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const canGoBack = currentStep > 0
  const canGoNext = currentStep < STEPS.length - 1

  useEffect(() => {
    if (!invitationId) return
    void hydrateInvitation(invitationId)
  }, [hydrateInvitation, invitationId])

  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 0: return <ThemePicker selected={selectedTheme} onSelect={setTheme} />
      case 1: return <StepMempelai />
      case 2: return <StepAcara />
      case 3: return <StepGallery />
      default: return null
    }
  }, [currentStep, selectedTheme, setTheme])

  return (
    <CmsLayout
      sidebarLinks={CMS_SIDEBAR_LINKS.general}
      title="Invitation Editor"
      subtitle="Editor web invitation lama tetap tersedia dari workspace baru."
    >
      <Button variant="ghost" className="px-0 mb-4 text-muted-foreground hover:bg-transparent" onClick={() => navigate(`/cms/sapatamu/${invitationId}/send`)}>
        <ChevronLeft className="w-4 h-4 mr-2" />
        Kembali ke manage invitation
      </Button>
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {STEPS.map((step, i) => (
              <button
                key={step}
                onClick={() => setStep(i)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors duration-280',
                  i === currentStep
                    ? 'bg-accent/10 text-accent font-medium'
                    : i < currentStep
                    ? 'bg-success/10 text-success'
                    : 'bg-muted text-muted-foreground'
                )}
                id={`step-${i}`}
              >
                <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0" style={{
                  borderColor: i === currentStep ? 'var(--terracotta)' : i < currentStep ? 'var(--success)' : 'var(--border)',
                  backgroundColor: i < currentStep ? 'var(--success)' : 'transparent',
                  color: i < currentStep ? 'white' : 'inherit',
                }}>
                  {i < currentStep ? '✓' : i + 1}
                </span>
                <span className="hidden sm:inline">{step}</span>
              </button>
            ))}
          </div>

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-lg font-heading text-foreground mb-5">{STEPS[currentStep]}</h3>
            {renderStepContent()}
          </motion.div>

          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setStep(currentStep - 1)}
              disabled={!canGoBack}
              className="gap-2"
              id="step-prev"
            >
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </Button>

            <div className="lg:hidden">
              <Button
                variant="ghost"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
                id="step-toggle-preview"
              >
                <Eye className="w-4 h-4" /> {showPreview ? 'Tutup Preview' : 'Preview'}
              </Button>
            </div>

            {canGoNext ? (
              <Button onClick={() => setStep(currentStep + 1)} className="gap-2 bg-accent hover:bg-terracotta-hover text-white" id="step-next">
                Selanjutnya <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                className="gap-2 bg-success hover:bg-success/90 text-white"
                id="step-publish"
                disabled={isSaving || isLoading}
                onClick={async () => {
                  setIsSaving(true)
                  try {
                    await saveInvitation()
                  } finally {
                    setIsSaving(false)
                  }
                }}
              >
                {isSaving ? 'Menyimpan...' : 'Simpan & Publikasikan'}
              </Button>
            )}
          </div>
        </div>

        <div className={cn(
          'w-[340px] shrink-0 sticky top-24 self-start',
          'hidden lg:block'
        )}>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-foreground">Live Preview</h4>
              <Eye className="w-4 h-4 text-muted-foreground" />
            </div>
            <LivePreviewMockup />
          </div>
        </div>
      </div>

      {showPreview && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          className="fixed inset-0 z-50 bg-background lg:hidden flex items-center justify-center p-6"
        >
          <div className="w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium">Live Preview</h4>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)} id="close-mobile-preview">Tutup</Button>
            </div>
            <LivePreviewMockup />
          </div>
        </motion.div>
      )}
    </CmsLayout>
  )
}
