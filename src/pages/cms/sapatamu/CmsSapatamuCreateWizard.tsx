import { useEffect, useMemo, useRef, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ErrorNotice } from '@/components/feedback/ErrorNotice'
import {
  buildInvitationLabel,
  buildSlugPreview,
  createDefaultDraftState,
  formatHumanDate,
  getThemeReleaseLabel,
  getThemePreset,
  isThemeComingSoon,
  resolveThemeGroup,
  resolveThemeTierCategory,
} from '@/lib/sapatamu'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useSapatamuDraftStore } from '@/stores/sapatamuDraftStore'
import type {
  SapatamuEvent,
  SapatamuThemeCatalogItem,
  TierCategory,
} from '@/types/sapatamu'

const STEPS = ['Invitation', 'Theme', 'Profiles', 'Events', 'Finish']
let draftBootstrapPromise: Promise<string> | null = null

type WizardProps = {
  onClose: () => void
}

function ThemeChooser({
  themes,
  selectedThemeId,
  onSelect,
}: {
  themes: SapatamuThemeCatalogItem[]
  selectedThemeId: string
  onSelect: (id: string) => void
}) {
  const selectedTheme = themes.find((item) => item.id === selectedThemeId)
  const [activeCategory, setActiveCategory] = useState<TierCategory>(resolveThemeTierCategory(selectedTheme))

  useEffect(() => {
    setActiveCategory(resolveThemeTierCategory(selectedTheme))
  }, [selectedTheme])

  const categories: TierCategory[] = ['basic', 'premium', 'vintage']
  const visibleThemes = themes.filter((item) => resolveThemeTierCategory(item) === activeCategory)
  const activeCategoryComingSoon = activeCategory !== 'premium'

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-2xl bg-muted p-1">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
              activeCategory === category ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
            )}
          >
            <span>{category === 'basic' ? 'Basic' : category === 'premium' ? 'Signature' : 'Vintage'}</span>
            {category !== 'premium' ? (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                Soon
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {activeCategoryComingSoon ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tema {activeCategory === 'basic' ? 'Basic' : 'Vintage'} sedang disiapkan. Untuk sementara pilih tema Signature/Premium.
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleThemes.map((theme) => {
          const preset = getThemePreset(theme.code)
          const isActive = selectedThemeId === theme.id
          const isComingSoon = isThemeComingSoon(theme)

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => {
                if (!isComingSoon) onSelect(theme.id)
              }}
              disabled={isComingSoon}
              className={cn(
                'rounded-[1.4rem] border p-3 text-left transition-all duration-300',
                isActive
                  ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                  : 'border-border bg-card hover:border-accent/40 hover:-translate-y-0.5',
                isComingSoon && 'cursor-not-allowed opacity-65 hover:translate-y-0 hover:border-border',
              )}
            >
              <div
                className="aspect-[5/3] rounded-xl p-4 flex flex-col justify-between"
                style={{
                  background: `linear-gradient(135deg, ${preset.secondaryColor}, ${preset.primaryColor}18)`,
                  color: preset.primaryColor,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] tracking-[0.16em] uppercase opacity-60">{resolveThemeGroup(theme)}</p>
                  <Badge className={cn('border-0 bg-white/75 text-foreground', isComingSoon && 'bg-amber-100 text-amber-800')}>
                    {isComingSoon ? getThemeReleaseLabel(theme) : activeCategory === 'premium' ? 'Signature' : resolveThemeGroup(theme)}
                  </Badge>
                </div>
                <div>
                  <p className="text-lg" style={{ fontFamily: preset.fontHeading }}>{theme.name}</p>
                  <p className="text-xs opacity-70 mt-1">{theme.description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CmsSapatamuCreateWizard({ onClose }: WizardProps) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const draftIdFromQuery = searchParams.get('draft')
  const { home, loadHome } = useDashboardStore()
  const {
    draftId,
    draft,
    isLoading,
    isSaving,
    error,
    createDraft,
    loadDraft,
    patchLocal,
    setProfiles,
    setEvents,
    persistDraft,
    deleteDraft,
    finalizeDraft,
    reset,
  } = useSapatamuDraftStore()
  const [dirty, setDirty] = useState(false)
  const autosaveTimerRef = useRef<number | null>(null)
  const lastPersistedSnapshotRef = useRef('')

  const themes = home?.catalog.themes ?? []
  const draftSnapshot = useMemo(() => JSON.stringify(draft), [draft])

  useEffect(() => {
    if (!home) {
      void loadHome()
    }
  }, [home, loadHome])

  useEffect(() => {
    return () => reset()
  }, [reset])

  useEffect(() => {
    if (!draftId) return
    if (dirty) return

    lastPersistedSnapshotRef.current = draftSnapshot
  }, [draftId, draftSnapshot, dirty])

  useEffect(() => {
    if (draftIdFromQuery) {
      if (draftId !== draftIdFromQuery) {
        void loadDraft(draftIdFromQuery)
      }
      return
    }

    if (draftId) return

    if (!draftBootstrapPromise) {
      draftBootstrapPromise = createDraft(createDefaultDraftState()).finally(() => {
        draftBootstrapPromise = null
      })
    }

    void draftBootstrapPromise
      .then((id) => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev)
          next.set('draft', id)
          return next
        }, { replace: true })
      })
      .catch(() => undefined)
  }, [createDraft, draftId, draftIdFromQuery, loadDraft, setSearchParams])

  useEffect(() => {
    if (!dirty || !draftId) return

    if (draftSnapshot === lastPersistedSnapshotRef.current) {
      setDirty(false)
      return
    }

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current)
    }

    autosaveTimerRef.current = window.setTimeout(() => {
      const pendingSnapshot = draftSnapshot

      void persistDraft()
        .then(() => {
          lastPersistedSnapshotRef.current = pendingSnapshot
          setDirty(false)
        })
        .catch(() => undefined)
    }, 1200)

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current)
      }
    }
  }, [dirty, draftId, draftSnapshot, persistDraft])

  const currentStep = draft.step
  const selectedTheme = themes.find((item) => item.id === draft.themeId) ?? themes[0] ?? null
  const selectedThemeComingSoon = isThemeComingSoon(selectedTheme ?? undefined)

  const updateDraftField = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => {
    patchLocal({ [key]: value } as Partial<typeof draft>)
    setDirty(true)
  }

  const flushDraft = async (patch?: Partial<typeof draft>) => {
    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current)
      autosaveTimerRef.current = null
    }

    const nextSnapshot = JSON.stringify({
      ...draft,
      ...patch,
    })

    await persistDraft(patch)
    lastPersistedSnapshotRef.current = nextSnapshot
    setDirty(false)
  }

  const handleNext = async () => {
    const nextStep = Math.min(currentStep + 1, STEPS.length - 1)
    await flushDraft({ step: nextStep })
  }

  const handleBack = async () => {
    const nextStep = Math.max(currentStep - 1, 0)
    await flushDraft({ step: nextStep })
  }

  const handleFinish = async () => {
    await flushDraft({ step: 4 })
    const result = await finalizeDraft()
    await loadHome()
    navigate(result.nextPath)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="draft-invitation-name">Nama invitation</Label>
              <Input
                id="draft-invitation-name"
                value={draft.invitationName}
                onChange={(event) => updateDraftField('invitationName', event.target.value)}
                placeholder="contoh: Ryan"
                className="h-12 rounded-xl"
              />
              <p className="text-sm text-muted-foreground">
                Nama ini akan dipakai sebagai judul di dashboard, manage, dan editor.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="draft-slug">Link undangan</Label>
              <Input
                id="draft-slug"
                value={draft.slugCandidate}
                onChange={(event) =>
                  updateDraftField('slugCandidate', event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                }
                placeholder="contoh: ryan-laras"
                className="h-12 rounded-xl"
              />
              <p className="text-sm text-muted-foreground">Preview: <span className="text-foreground">{buildSlugPreview(draft.slugCandidate)}</span></p>
            </div>
          </div>
        )
      case 1:
        return (
          <ThemeChooser
            themes={themes}
            selectedThemeId={draft.themeId}
            onSelect={(themeId) => updateDraftField('themeId', themeId)}
          />
        )
      case 2:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {draft.profiles.map((profile, index) => (
              <div key={profile.id} className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{profile.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {index === 0 ? 'Digunakan untuk profil pasangan pertama.' : 'Digunakan untuk profil pasangan kedua.'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={profile.fullName}
                    onChange={(event) => {
                      const next = [...draft.profiles]
                      next[index] = { ...profile, fullName: event.target.value }
                      setProfiles(next)
                      setDirty(true)
                    }}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nickname</Label>
                  <Input
                    value={profile.nickName}
                    onChange={(event) => {
                      const next = [...draft.profiles]
                      next[index] = { ...profile, nickName: event.target.value }
                      setProfiles(next)
                      setDirty(true)
                    }}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={profile.description}
                    onChange={(event) => {
                      const next = [...draft.profiles]
                      next[index] = { ...profile, description: event.target.value }
                      setProfiles(next)
                      setDirty(true)
                    }}
                    rows={4}
                    className="rounded-xl"
                  />
                </div>
              </div>
            ))}
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            {draft.events.map((eventItem, index) => (
              <EventFormCard
                key={eventItem.id}
                eventItem={eventItem}
                index={index}
                onChange={(nextEvent) => {
                  const next = [...draft.events]
                  next[index] = nextEvent
                  setEvents(next)
                  setDirty(true)
                }}
              />
            ))}
          </div>
        )
      case 4:
        return (
          <div className="space-y-5">
            <div className="rounded-[1.6rem] border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Invitation siap dibuat</p>
              <h3 className="text-2xl font-semibold text-foreground mt-2">
                {draft.invitationName || buildInvitationLabel(draft.profiles)}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">{buildSlugPreview(draft.slugCandidate)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Theme</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-foreground">{selectedTheme?.name ?? 'Belum dipilih'}</p>
                  {selectedThemeComingSoon ? (
                    <Badge className="border-0 bg-amber-100 text-amber-800">{getThemeReleaseLabel(selectedTheme ?? undefined)}</Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedTheme ? resolveThemeGroup(selectedTheme) : 'Pilih tema sebelum menyelesaikan wizard'}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Event Aktif</p>
                <p className="text-base font-semibold text-foreground mt-3">
                  {draft.events.filter((item) => item.enabled).length} acara
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Terakhir disimpan {draftId ? formatHumanDate(new Date().toISOString()) : '-'}
                </p>
              </div>
            </div>

            {selectedThemeComingSoon ? (
              <div className="rounded-[1.6rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                Tema ini belum dibuka untuk pembuatan invitation. Silakan kembali ke step Theme dan pilih Signature/Premium.
              </div>
            ) : null}

            <div className="rounded-[1.6rem] border border-accent/20 bg-accent/5 p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <p className="text-sm font-semibold text-foreground">Setelah klik finish</p>
              </div>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p>Invitation langsung dibuat dan bisa dikelola dari workspace manage.</p>
                <p>Link publik belum aktif sampai Anda melanjutkan ke flow aktivasi paket.</p>
                <p>Preview tetap bisa dilakukan dari invitation editor internal.</p>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm px-4 py-6 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto rounded-[2rem] bg-background border border-border shadow-2xl overflow-hidden">
        <div className="border-b border-border px-5 lg:px-8 py-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Create SapaTamu</p>
            <h2 className="text-2xl font-semibold text-foreground mt-1">Buat invitation dulu, aktivasi nanti saat siap dipublikasikan.</h2>
          </div>
          <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 lg:px-8 py-5 border-b border-border">
          <div className="grid grid-cols-5 gap-3">
            {STEPS.map((step, index) => (
              <div key={step} className="space-y-2">
                <div className={cn('h-1.5 rounded-full', index <= currentStep ? 'bg-accent' : 'bg-muted')} />
                <p className={cn('text-xs font-medium', index <= currentStep ? 'text-foreground' : 'text-muted-foreground')}>
                  {index + 1}. {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 lg:px-8 py-6 lg:py-8 space-y-6">
          {error && <ErrorNotice message={error} />}
          {isLoading ? (
            <div className="h-[360px] flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Memuat draft...
            </div>
          ) : (
            renderStep()
          )}
        </div>

        <div className="border-t border-border px-5 lg:px-8 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>Tutup</Button>
            {draftId && (
              <Button
                variant="ghost"
                className="text-muted-foreground"
                disabled={isSaving}
                onClick={() => {
                  void deleteDraft().then(async () => {
                    await loadHome()
                    onClose()
                  })
                }}
              >
                Hapus Draft
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={() => void handleBack()} disabled={isSaving}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {currentStep < STEPS.length - 1 ? (
              <Button onClick={() => void handleNext()} disabled={isSaving || (currentStep === 1 && selectedThemeComingSoon)}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={() => void handleFinish()} disabled={isSaving || selectedThemeComingSoon}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Finish & Manage
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EventFormCard({
  eventItem,
  index,
  onChange,
}: {
  eventItem: SapatamuEvent
  index: number
  onChange: (value: SapatamuEvent) => void
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Event {index + 1}</p>
          <p className="text-xs text-muted-foreground">
            {index === 1 ? 'Event kedua boleh dinonaktifkan jika tidak dibutuhkan.' : 'Event utama invitation.'}
          </p>
        </div>
        {index === 1 && (
          <button
            type="button"
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              eventItem.enabled ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground',
            )}
            onClick={() => onChange({ ...eventItem, enabled: !eventItem.enabled })}
          >
            {eventItem.enabled ? 'Aktif' : 'Nonaktif'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Event Name</Label>
          <Input value={eventItem.name} onChange={(event) => onChange({ ...eventItem, name: event.target.value })} className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={eventItem.date} onChange={(event) => onChange({ ...eventItem, date: event.target.value })} className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Time Started</Label>
          <Input type="time" value={eventItem.timeStart} onChange={(event) => onChange({ ...eventItem, timeStart: event.target.value })} className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Time End</Label>
          <Input type="time" value={eventItem.timeEnd} onChange={(event) => onChange({ ...eventItem, timeEnd: event.target.value })} className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Time Zone</Label>
          <select
            value={eventItem.timeZone}
            onChange={(event) => onChange({ ...eventItem, timeZone: event.target.value as SapatamuEvent['timeZone'] })}
            className="h-11 rounded-xl border border-input bg-transparent px-3 text-sm w-full"
          >
            <option value="WIB">WIB</option>
            <option value="WITA">WITA</option>
            <option value="WIT">WIT</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Map Location</Label>
          <Input value={eventItem.mapLocation} onChange={(event) => onChange({ ...eventItem, mapLocation: event.target.value })} className="h-11 rounded-xl" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Event Address</Label>
        <Textarea value={eventItem.address} onChange={(event) => onChange({ ...eventItem, address: event.target.value })} rows={3} className="rounded-xl" />
      </div>
    </div>
  )
}
