import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Send,
  Trash2,
  CreditCard,
  Megaphone,
  Link2,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ErrorNotice } from '@/components/feedback/ErrorNotice'
import { PrefaceComposer } from '@/components/feedback/PrefaceComposer'
import { CMS_SIDEBAR_LINKS, formatRupiah } from '@/lib/constants'
import {
  buildGuestWhatsappUrl,
  buildInvitationLabel,
  buildMetadataTitle,
  formatHumanDate,
  resolvePrefaceTemplate,
} from '@/lib/sapatamu'
import { formatUploadSize, SAPATAMU_ALBUM_MAX_SIZE_BYTES } from '@/lib/upload'
import { cn } from '@/lib/utils'
import { resolveApiAssetUrl, sapatamuUpsertCart } from '@/lib/api'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useSapatamuWorkspaceStore } from '@/stores/sapatamuWorkspaceStore'
import type {
  SapatamuEvent,
  SapatamuGiftAccount,
  SapatamuPackageCatalogItem,
  SapatamuProfile,
  WorkspaceGuest,
} from '@/types/sapatamu'

const TAB_ITEMS = [
  { key: 'send', label: 'Send' },
  { key: 'bride-groom', label: 'Bride & Groom' },
  { key: 'events', label: 'Event Detail' },
  { key: 'album', label: 'My Album' },
  { key: 'rsvp', label: 'RSVP' },
  { key: 'messages', label: 'Message' },
  { key: 'settings', label: 'Setting' },
] as const

function isPlayableYoutubeUrl(value: string) {
  const clean = value.trim()
  if (!clean) return true
  try {
    const parsed = new URL(clean)
    return parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')
  } catch {
    return false
  }
}

type TabKey = (typeof TAB_ITEMS)[number]['key']

function createEmptyGuest(): WorkspaceGuest {
  return {
    id: `local-${Date.now()}`,
    name: '',
    phoneNumber: '',
    sendStatus: 'draft',
    lastSentAt: null,
    personalizedUrl: '',
  }
}

function createEmptyGiftAccount(): SapatamuGiftAccount {
  return {
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  }
}

export function CmsSapatamuWorkspace() {
  const navigate = useNavigate()
  const { invitationId = '', tab = 'send' } = useParams<{ invitationId: string; tab: TabKey }>()
  const {
    workspace,
    history,
    isLoading,
    isSaving,
    error,
    loadWorkspace,
    loadHistory,
    setGuests,
    setPrefaceTemplate,
    updateProfiles,
    updateEvents,
    saveSend,
    saveSettings,
    uploadAlbumImage,
    deleteAlbumImage,
    moderateMessage,
    deleteInvitation,
  } = useSapatamuWorkspaceStore()
  const { loadHome } = useDashboardStore()

  const [profilesForm, setProfilesForm] = useState<SapatamuProfile[]>([])
  const [eventsForm, setEventsForm] = useState<SapatamuEvent[]>([])
  const [settingsForm, setSettingsForm] = useState({
    slugCandidate: '',
    metaTitleTemplate: '',
    metaDescription: '',
    metaImageUrl: '',
    musicMode: 'none' as 'none' | 'library' | 'youtube',
    musicValue: '',
    extraYoutube: '',
    giftAccounts: [createEmptyGiftAccount()] as SapatamuGiftAccount[],
    giftAddress: '',
  })
  const [messageSearch, setMessageSearch] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPackageDialog, setShowPackageDialog] = useState(false)
  const [showAlbumDialog, setShowAlbumDialog] = useState(false)
  const albumInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!invitationId) return
    void loadWorkspace(invitationId)
    void loadHistory(invitationId)
  }, [invitationId, loadHistory, loadWorkspace])

  useEffect(() => {
    if (!workspace) return

    setProfilesForm(workspace.profiles)
    setEventsForm(workspace.events)
    setSettingsForm({
      slugCandidate: workspace.invitation.slug,
      metaTitleTemplate: workspace.settings.meta.titleTemplate,
      metaDescription: workspace.settings.meta.description,
      metaImageUrl: workspace.settings.meta.imageUrl ?? '',
      musicMode: workspace.settings.musicSettings.mode,
      musicValue: workspace.settings.musicSettings.value,
      extraYoutube: workspace.settings.extraLinks.youtube,
      giftAccounts: workspace.settings.giftAccounts.length
        ? workspace.settings.giftAccounts
        : [createEmptyGiftAccount()],
      giftAddress: workspace.settings.giftAddress ?? '',
    })
  }, [workspace])

  const activeTab = (TAB_ITEMS.find((item) => item.key === tab)?.key ?? 'send') as TabKey
  const filteredMessages = useMemo(() => {
    const keyword = messageSearch.toLowerCase()
    return (workspace?.messages ?? []).filter((item) => {
      return item.guestName.toLowerCase().includes(keyword) || item.message.toLowerCase().includes(keyword)
    })
  }, [messageSearch, workspace?.messages])

  const prefaceTokens = useMemo(() => {
    if (!workspace) return []
    const event1 = workspace.events[0]
    const event2 = workspace.events[1]
    const previewGuestName = workspace.send.guests[0]?.name || 'Bapak/Ibu Tamu Undangan'

    return [
      { token: 'guest-name', label: 'Nama tamu', value: previewGuestName },
      { token: 'full-name-1', label: 'Nama lengkap 1', value: workspace.profiles[0]?.fullName || 'Nama lengkap 1' },
      { token: 'full-name-2', label: 'Nama lengkap 2', value: workspace.profiles[1]?.fullName || 'Nama lengkap 2' },
      { token: 'nick-name-1', label: 'Panggilan 1', value: workspace.profiles[0]?.nickName || workspace.profiles[0]?.fullName || 'Panggilan 1' },
      { token: 'nick-name-2', label: 'Panggilan 2', value: workspace.profiles[1]?.nickName || workspace.profiles[1]?.fullName || 'Panggilan 2' },
      { token: 'event-name-1', label: 'Nama event 1', value: event1?.name || 'Event 1' },
      { token: 'event-name-2', label: 'Nama event 2', value: event2?.name || 'Event 2' },
      { token: 'event-date-1', label: 'Tanggal event 1', value: event1?.date ? formatHumanDate(event1.date) : 'Tanggal event 1' },
      { token: 'event-date-2', label: 'Tanggal event 2', value: event2?.date ? formatHumanDate(event2.date) : 'Tanggal event 2' },
      { token: 'time-start-1', label: 'Jam mulai 1', value: event1?.timeStart || 'Jam mulai 1' },
      { token: 'time-end-1', label: 'Jam selesai 1', value: event1?.timeEnd || 'Jam selesai 1' },
      { token: 'event-timezone-1', label: 'Zona 1', value: event1?.timeZone || 'WIB' },
      { token: 'time-start-2', label: 'Jam mulai 2', value: event2?.timeStart || 'Jam mulai 2' },
      { token: 'time-end-2', label: 'Jam selesai 2', value: event2?.timeEnd || 'Jam selesai 2' },
      { token: 'event-timezone-2', label: 'Zona 2', value: event2?.timeZone || 'WIB' },
      { token: 'event-location-1', label: 'Lokasi 1', value: event1?.address || 'Lokasi 1' },
      { token: 'event-location-2', label: 'Lokasi 2', value: event2?.address || 'Lokasi 2' },
      { token: 'link', label: 'Link undangan', value: workspace.invitation.publicUrl },
    ]
  }, [workspace])

  const handleGuestChange = (guestId: string, patch: Partial<WorkspaceGuest>) => {
    if (!workspace) return
    setGuests(
      workspace.send.guests.map((item) =>
        item.id === guestId
          ? {
              ...item,
              ...patch,
            }
          : item,
      ),
    )
  }

  const handleGuestAction = async (guest: WorkspaceGuest, action: 'copy' | 'send') => {
    if (!workspace) return
    const message = resolvePrefaceTemplate(
      workspace.send.prefaceTemplate,
      workspace.profiles,
      workspace.events,
      workspace.invitation.publicUrl,
      guest,
    )

    if (action === 'copy') {
      await navigator.clipboard.writeText(message)
    } else {
      window.open(buildGuestWhatsappUrl(workspace.send.prefaceTemplate, workspace, guest), '_blank', 'noopener,noreferrer')
    }

    handleGuestChange(guest.id, {
      sendStatus: action === 'copy' ? 'copied' : 'sent',
      lastSentAt: new Date().toISOString(),
    })
    await saveSend(invitationId)
  }

  const handleSaveSettings = async () => {
    await saveSettings(invitationId, settingsForm)
  }

  const handlePrefaceAutosave = async (value: string) => {
    setPrefaceTemplate(value)
    await saveSend(invitationId)
  }

  const handleSelectMetadataImage = async (imageUrl: string) => {
    const next = { ...settingsForm, metaImageUrl: imageUrl }
    setSettingsForm(next)
    await saveSettings(invitationId, next)
  }

  const handleDeleteInvitation = async () => {
    await deleteInvitation(invitationId)
    await loadHome()
    navigate('/cms')
  }

  const startAddOnCheckout = async (pkg: SapatamuPackageCatalogItem) => {
    await sapatamuUpsertCart(invitationId, { packageId: pkg.id, kind: 'photo_add_on' })
    navigate(`/cms/sapatamu/${invitationId}/cart`)
  }

  const startEditTimeCheckout = async (pkg: SapatamuPackageCatalogItem) => {
    await sapatamuUpsertCart(invitationId, { packageId: pkg.id, kind: 'edit_time_add_on' })
    navigate(`/cms/sapatamu/${invitationId}/cart`)
  }

  const handleAlbumUploadClick = () => {
    albumInputRef.current?.click()
  }

  const handleAlbumFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    void uploadAlbumImage(invitationId, file)
    event.target.value = ''
  }

  const formatAccessLabel = (access: {
    status: 'inactive' | 'unknown' | 'active' | 'expired' | 'lifetime'
    remainingDays: number | null
    expiresAt: string | null
  }) => {
    if (access.status === 'inactive') return 'Akan dimulai setelah aktivasi'
    if (access.status === 'unknown') return 'Belum dapat dihitung'
    if (access.status === 'lifetime') return 'Selamanya'
    if (access.status === 'expired') return 'Sudah berakhir'
    if (access.remainingDays !== null) return `${access.remainingDays} hari lagi`
    return access.expiresAt ? formatHumanDate(access.expiresAt) : '-'
  }

  const renderHeader = () => {
    if (!workspace) return null

    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <Button variant="ghost" className="px-0 text-muted-foreground hover:bg-transparent" onClick={() => navigate('/cms')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke dashboard
            </Button>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-semibold text-foreground">{buildInvitationLabel(workspace.profiles)}</h2>
              <Badge className={workspace.invitation.activationState === 'active' ? 'border-0 bg-accent/10 text-accent' : 'border-0 bg-warning/10 text-warning'}>
                {workspace.invitation.activationState === 'active' ? 'Aktif' : 'Belum Aktif'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{workspace.invitation.canPublicOpen ? workspace.invitation.publicUrl : `${workspace.invitation.publicUrl} (belum aktif)`}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {workspace.invitation.activationState !== 'active' && (
              <Button onClick={() => navigate(`/cms/sapatamu/${invitationId}/activate`)}>
                <CreditCard className="w-4 h-4 mr-2" />
                Aktifkan Undangan
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(workspace.invitation.previewUrl)}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Preview Editor
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-flex rounded-2xl bg-muted p-1 min-w-full lg:min-w-0">
            {TAB_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(`/cms/sapatamu/${invitationId}/${item.key}`)}
                className={cn(
                  'rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                  activeTab === item.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {workspace.invitation.activationState !== 'active' && (
          <div className="rounded-[1.4rem] border border-warning/30 bg-warning/5 px-5 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-foreground">Link publik belum aktif</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Invitation sudah bisa dikelola dari workspace ini, tetapi tamu belum bisa membuka link sampai Anda menyelesaikan aktivasi paket.
                </p>
              </div>
              <Button onClick={() => navigate(`/cms/sapatamu/${invitationId}/activate`)}>
                Aktifkan Sekarang
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderSendTab = () => {
    if (!workspace) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="rounded-[1.6rem] border border-border bg-card p-5 lg:p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-foreground">Guest Send List</p>
                <p className="text-sm text-muted-foreground">Simpan daftar tamu, nomor WhatsApp, dan status pengiriman dari satu tempat.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setGuests([...(workspace.send.guests ?? []), createEmptyGuest()])}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Tamu
              </Button>
            </div>

            <div className="space-y-3">
              {workspace.send.guests.map((guest) => (
                <div key={guest.id} className="rounded-2xl bg-muted/35 p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-[1.35fr_1fr] gap-3">
                    <Input
                      value={guest.name}
                      onChange={(event) => handleGuestChange(guest.id, { name: event.target.value })}
                      placeholder="Nama tamu"
                      className="h-11 rounded-xl bg-background"
                    />
                    <Input
                      value={guest.phoneNumber ?? ''}
                      onChange={(event) => handleGuestChange(guest.id, { phoneNumber: event.target.value })}
                      placeholder="Nomor WhatsApp"
                      className="h-11 rounded-xl bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-center">
                    <p className="text-xs text-muted-foreground truncate">{guest.personalizedUrl || 'Link personal muncul setelah disimpan.'}</p>
                    <Badge className="border-0 bg-card text-foreground">{guest.sendStatus}</Badge>
                    <Button variant="outline" size="sm" onClick={() => void handleGuestAction(guest, 'copy')}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button size="sm" onClick={() => void handleGuestAction(guest, 'send')}>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              ))}

              {workspace.send.guests.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Belum ada tamu. Tambahkan tamu agar link personal dan template pengiriman bisa langsung dipakai.
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => void saveSend(invitationId)} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Save Send List
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.6rem] border border-border bg-card p-5 lg:p-6 space-y-4">
              <PrefaceComposer
                template={workspace.send.prefaceTemplate}
                tokens={prefaceTokens}
                onAutosave={handlePrefaceAutosave}
              />
            </div>

            <div className="rounded-[1.6rem] border border-border bg-card p-5 lg:p-6 space-y-3">
              <p className="text-lg font-semibold text-foreground">Metadata Preview</p>
              <div className="rounded-2xl bg-muted/35 p-4 space-y-3">
                {workspace.send.metadataPreview.imageUrl ? (
                  <img
                    src={resolveApiAssetUrl(workspace.send.metadataPreview.imageUrl)}
                    alt="Metadata invitation"
                    className="h-40 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground">
                    Belum ada foto metadata
                  </div>
                )}
                <p className="text-sm font-semibold text-foreground">{buildMetadataTitle(workspace)}</p>
                <p className="text-xs text-muted-foreground">
                  {workspace.send.metadataPreview.date ? formatHumanDate(workspace.send.metadataPreview.date) : 'Tanggal acara belum diisi'}
                </p>
                <p className="text-xs text-muted-foreground break-all">{workspace.send.metadataPreview.link}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Bagian metadata ini memakai sumber data yang sama dengan halaman setting: title template, foto metadata, dan tanggal acara aktif.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderBrideGroomTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {profilesForm.map((profile, index) => (
        <div key={profile.id} className="rounded-[1.6rem] border border-border bg-card p-5 lg:p-6 space-y-4">
          <div>
            <p className="text-lg font-semibold text-foreground">{index === 0 ? 'Bride / Groom 1' : 'Bride / Groom 2'}</p>
            <p className="text-sm text-muted-foreground mt-1">Perubahan nama dan panggilan di sini akan otomatis memengaruhi token preface.</p>
          </div>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={profile.fullName} onChange={(event) => {
              const next = [...profilesForm]
              next[index] = { ...profile, fullName: event.target.value }
              setProfilesForm(next)
            }} className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Nickname</Label>
            <Input value={profile.nickName} onChange={(event) => {
              const next = [...profilesForm]
              next[index] = { ...profile, nickName: event.target.value }
              setProfilesForm(next)
            }} className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={profile.description} onChange={(event) => {
              const next = [...profilesForm]
              next[index] = { ...profile, description: event.target.value }
              setProfilesForm(next)
            }} rows={4} className="rounded-xl" />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => void updateProfiles(invitationId, profilesForm)} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </Button>
          </div>
        </div>
      ))}
    </div>
  )

  const renderEventsTab = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max">
          {eventsForm.map((eventItem, index) => (
            <div key={eventItem.id} className="w-[360px] rounded-[1.6rem] border border-border bg-card p-5 lg:p-6 space-y-4 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-foreground">{eventItem.name || `Event ${index + 1}`}</p>
                  <p className="text-sm text-muted-foreground mt-1">Card horizontal agar detail acara lebih cepat dipindai.</p>
                </div>
                <Badge className={eventItem.enabled ? 'border-0 bg-accent/10 text-accent' : 'border-0 bg-muted text-muted-foreground'}>
                  {eventItem.enabled ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Nama Event</Label>
                <Input value={eventItem.name} onChange={(event) => {
                  const next = [...eventsForm]
                  next[index] = { ...eventItem, name: event.target.value }
                  setEventsForm(next)
                }} className="h-11 rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Input type="date" value={eventItem.date} onChange={(event) => {
                    const next = [...eventsForm]
                    next[index] = { ...eventItem, date: event.target.value }
                    setEventsForm(next)
                  }} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Zona</Label>
                  <select
                    value={eventItem.timeZone}
                    onChange={(event) => {
                      const next = [...eventsForm]
                      next[index] = { ...eventItem, timeZone: event.target.value as SapatamuEvent['timeZone'] }
                      setEventsForm(next)
                    }}
                    className="h-11 rounded-xl border border-input bg-transparent px-3 text-sm w-full"
                  >
                    <option value="WIB">WIB</option>
                    <option value="WITA">WITA</option>
                    <option value="WIT">WIT</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Mulai</Label>
                  <Input type="time" value={eventItem.timeStart} onChange={(event) => {
                    const next = [...eventsForm]
                    next[index] = { ...eventItem, timeStart: event.target.value }
                    setEventsForm(next)
                  }} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Selesai</Label>
                  <Input type="time" value={eventItem.timeEnd} onChange={(event) => {
                    const next = [...eventsForm]
                    next[index] = { ...eventItem, timeEnd: event.target.value }
                    setEventsForm(next)
                  }} className="h-11 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Alamat Acara</Label>
                <Textarea value={eventItem.address} onChange={(event) => {
                  const next = [...eventsForm]
                  next[index] = { ...eventItem, address: event.target.value }
                  setEventsForm(next)
                }} rows={3} className="rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label>Map Location</Label>
                <Input value={eventItem.mapLocation} onChange={(event) => {
                  const next = [...eventsForm]
                  next[index] = { ...eventItem, mapLocation: event.target.value }
                  setEventsForm(next)
                }} className="h-11 rounded-xl" />
              </div>

              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    const next = [...eventsForm]
                    next[index] = { ...eventItem, enabled: !eventItem.enabled }
                    setEventsForm(next)
                  }}
                >
                  {eventItem.enabled ? 'Nonaktifkan' : 'Aktifkan'}
                </Button>
                <Button onClick={() => void updateEvents(invitationId, eventsForm)} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setEventsForm([
              ...eventsForm,
              {
                id: `event-${Date.now()}`,
                name: `Acara ${eventsForm.length + 1}`,
                date: '',
                timeStart: '',
                timeEnd: '',
                timeZone: 'WIB',
                address: '',
                mapLocation: '',
                enabled: true,
              },
            ])}
            className="w-[240px] rounded-[1.6rem] border border-dashed border-border bg-card p-5 lg:p-6 flex flex-col items-center justify-center text-center text-muted-foreground hover:border-accent/40 hover:text-foreground transition-colors"
          >
            <Plus className="w-5 h-5 mb-3" />
            <p className="font-medium">Tambah Acara</p>
            <p className="text-sm mt-2">Buat event baru secara horizontal di baris yang sama.</p>
          </button>
        </div>
      </div>
    </div>
  )

  const renderAlbumTab = () => {
    if (!workspace) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6">
          <div className="rounded-[1.6rem] border border-border bg-card p-5 lg:p-6 space-y-4">
            <div>
              <p className="text-lg font-semibold text-foreground">Photo Quota</p>
              <p className="text-sm text-muted-foreground mt-1">Kuota foto mengikuti paket aktif atau tier minimum tema invitation ini.</p>
            </div>
            <div className="rounded-2xl bg-muted/35 p-4">
              <p className="text-3xl font-semibold text-foreground">{workspace.album.usedPhotoQuota} / {workspace.album.allowedPhotoQuota}</p>
              <p className="text-sm text-muted-foreground mt-2">Jika kuota habis, Anda perlu menambah add-on foto melalui flow cart dan checkout.</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowAlbumDialog(true)}>
              <CreditCard className="w-4 h-4 mr-2" />
              Add Quota
            </Button>
          </div>

          <div className="rounded-[1.6rem] border border-border bg-card p-5 lg:p-6 space-y-4">
            <input
              ref={albumInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAlbumFileChange}
            />

            <button
              type="button"
              onClick={handleAlbumUploadClick}
              className="w-full rounded-[1.5rem] border border-dashed border-border bg-muted/25 p-6 text-left transition-colors hover:bg-muted/40"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="max-w-2xl">
                  <p className="text-lg font-semibold text-foreground">Upload Foto</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Klik card ini untuk memilih foto dari perangkat Anda. Preview akan tampil di bawah area upload agar lebih lega dan mudah dicek.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Format: JPG, PNG, WEBP. Maksimal {formatUploadSize(SAPATAMU_ALBUM_MAX_SIZE_BYTES)} per foto.
                  </p>
                </div>
                <div className="inline-flex items-center rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm">
                  <ImagePlus className="w-4 h-4 mr-2" />
                  Upload Foto
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-border bg-card p-5 lg:p-6 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-lg font-semibold text-foreground">Preview Foto</p>
              <p className="text-sm text-muted-foreground mt-1">
                Preview dibuat lebih rapat dan clean agar mudah melihat banyak foto sekaligus tanpa memakan ruang berlebih.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{workspace.album.items.length} foto tersimpan</p>
          </div>

          {workspace.album.items.length ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
              {workspace.album.items.map((item) => (
                <div key={item.id} className="group relative overflow-hidden rounded-2xl bg-muted/15">
                  <img
                    src={resolveApiAssetUrl(item.url)}
                    alt={item.fileName ?? 'Foto undangan'}
                    className="h-44 w-full object-cover sm:h-48 xl:h-40"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent px-3 pb-3 pt-8 opacity-100 transition-opacity">
                    <p className="truncate text-xs text-white/90">
                      {item.fileName || 'Foto undangan'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteAlbumImage(invitationId, item.id)}
                    className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/65"
                    aria-label={`Hapus ${item.fileName || 'foto undangan'}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-sm text-muted-foreground">
              Belum ada foto yang diunggah.
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderRsvpTab = () => {
    if (!workspace) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard label="Attending" value={workspace.rsvp.attendingCount} />
          <MetricCard label="Not Attending" value={workspace.rsvp.notAttendingCount} />
          <MetricCard label="Jumlah Tamu Hadir" value={workspace.rsvp.totalGuestsComing} />
        </div>

        <div className="rounded-[1.6rem] border border-border bg-card p-5 lg:p-6 space-y-4">
          <p className="text-lg font-semibold text-foreground">Recent Responses</p>
          {workspace.rsvp.recentResponses.length ? (
            <div className="space-y-3">
              {workspace.rsvp.recentResponses.map((item) => (
                <div key={item.id} className="rounded-2xl bg-muted/35 p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="font-medium text-foreground">{item.guestName}</p>
                    <Badge className="border-0 bg-card text-foreground">{item.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {item.attendeesCount} tamu • {formatHumanDate(item.createdAt)}
                  </p>
                  <p className="text-sm text-foreground mt-3">{item.message || 'Tidak ada pesan tambahan.'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Belum ada RSVP yang masuk.
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderMessagesTab = () => {
    if (!workspace) return null

    return (
      <div className="space-y-6">
        <div className="rounded-[1.6rem] border border-border bg-card p-5 lg:p-6 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-lg font-semibold text-foreground">Pesan Tamu</p>
              <p className="text-sm text-muted-foreground mt-1">Gunakan tombol publish untuk menampilkan pesan di undangan publik.</p>
            </div>
            <Input
              value={messageSearch}
              onChange={(event) => setMessageSearch(event.target.value)}
              placeholder="Cari pesan atau nama tamu"
              className="w-full max-w-sm h-11 rounded-xl"
            />
          </div>

          <div className="space-y-3">
            {filteredMessages.length ? (
              filteredMessages.map((item) => (
                <div key={item.id} className="rounded-2xl bg-muted/35 p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-medium text-foreground">{item.guestName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatHumanDate(item.createdAt)}</p>
                    </div>
                    <Button
                      variant={item.isApproved ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => void moderateMessage(invitationId, item.id, !item.isApproved)}
                    >
                      <Megaphone className="w-4 h-4 mr-2" />
                      {item.isApproved ? 'Tarik' : 'Publish'}
                    </Button>
                  </div>
                  <p className="text-sm text-foreground mt-4 leading-7">{item.message}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                Belum ada pesan yang cocok dengan pencarian.
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderSettingsTab = () => {
    if (!workspace) return null

    return (
      <div className="space-y-6 font-sans tracking-normal">
        <Accordion className="space-y-4">
          <AccordionItem value="web-invitation" className="rounded-[1.4rem] border border-border bg-card px-5">
            <AccordionTrigger className="py-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Web Invitation</p>
                <p className="text-sm text-muted-foreground mt-1">Masuk ke invitation editor untuk preview dan tata letak halaman.</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <Button onClick={() => navigate(workspace.invitation.previewUrl)}>Buka Invitation Editor</Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="link" className="rounded-[1.4rem] border border-border bg-card px-5">
            <AccordionTrigger className="py-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Link</p>
                <p className="text-sm text-muted-foreground mt-1">{workspace.invitation.slug}</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5 space-y-3">
              <Input value={settingsForm.slugCandidate} onChange={(event) => setSettingsForm((current) => ({ ...current, slugCandidate: event.target.value }))} className="h-11 rounded-xl" />
              <Button onClick={() => void handleSaveSettings()} disabled={isSaving}>Save Link</Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="package" className="rounded-[1.4rem] border border-border bg-card px-5">
            <AccordionTrigger className="py-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Package</p>
                <p className="text-sm text-muted-foreground mt-1">{workspace.settings.packageOverview.currentPackage?.name ?? 'Belum aktif'}</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <Button onClick={() => setShowPackageDialog(true)}>Lihat Paket & Upgrade</Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="times" className="rounded-[1.4rem] border border-border bg-card px-5">
            <AccordionTrigger className="py-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Edit Time & Active Time</p>
                <p className="text-sm text-muted-foreground mt-1">Edit time adalah countdown akses edit. Active time mengikuti masa aktif paket yang sedang berjalan.</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-muted/35 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Edit Time</p>
                <p className="text-base font-semibold text-foreground mt-3">{formatAccessLabel(workspace.settings.editAccess)}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {workspace.settings.editAccess.expiresAt
                    ? `Berakhir pada ${formatHumanDate(workspace.settings.editAccess.expiresAt)}`
                    : workspace.settings.editAccess.status === 'inactive'
                      ? 'Countdown edit akan dimulai saat undangan aktif.'
                      : 'Tidak ada batas waktu edit saat ini.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {workspace.settings.editAccess.addOnPackages.map((pkg) => (
                    <Button key={pkg.id} variant="outline" size="sm" onClick={() => void startEditTimeCheckout(pkg)}>
                      +{String(pkg.features?.quantity ?? '-')} hari · {formatRupiah(pkg.price)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-muted/35 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Active Time</p>
                <p className="text-base font-semibold text-foreground mt-3">{formatAccessLabel(workspace.settings.activeAccess)}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {workspace.settings.activeAccess.expiresAt
                    ? `Aktif hingga ${formatHumanDate(workspace.settings.activeAccess.expiresAt)}`
                    : workspace.settings.activeAccess.status === 'lifetime'
                      ? 'Paket aktif selamanya.'
                      : 'Belum aktif.'}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="metadata" className="rounded-[1.4rem] border border-border bg-card px-5">
            <AccordionTrigger className="py-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Meta Data</p>
                <p className="text-sm text-muted-foreground mt-1">Title dan tanggal metadata memakai variabel agar cukup diubah dari satu sumber data.</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5 space-y-4">
              <div className="space-y-2">
                <Label>Foto Metadata</Label>
                {settingsForm.metaImageUrl ? (
                  <img
                    src={resolveApiAssetUrl(settingsForm.metaImageUrl)}
                    alt="Metadata invitation"
                    className="h-40 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground">
                    Pilih salah satu foto album untuk metadata.
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3 lg:grid-cols-5">
                  {workspace.album.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => void handleSelectMetadataImage(item.url)}
                      className={cn(
                        'overflow-hidden rounded-xl border transition-colors',
                        settingsForm.metaImageUrl === item.url ? 'border-accent' : 'border-border',
                      )}
                    >
                      <img
                        src={resolveApiAssetUrl(item.url)}
                        alt={item.fileName ?? 'Foto metadata'}
                        className="h-20 w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title Template</Label>
                <Input value={settingsForm.metaTitleTemplate} onChange={(event) => setSettingsForm((current) => ({ ...current, metaTitleTemplate: event.target.value }))} className="h-11 rounded-xl" />
                <p className="text-xs text-muted-foreground">Gunakan variabel seperti {`{{nick-name-1}}`} dan {`{{nick-name-2}}`}.</p>
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea value={settingsForm.metaDescription} onChange={(event) => setSettingsForm((current) => ({ ...current, metaDescription: event.target.value }))} rows={3} className="rounded-xl" />
              </div>
              <div className="rounded-2xl bg-muted/35 p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Preview Metadata</p>
                <p className="text-sm font-semibold text-foreground">{buildMetadataTitle({ ...workspace, settings: { ...workspace.settings, meta: { ...workspace.settings.meta, titleTemplate: settingsForm.metaTitleTemplate } } })}</p>
                <p className="text-xs text-muted-foreground">
                  {workspace.send.metadataPreview.date ? formatHumanDate(workspace.send.metadataPreview.date) : 'Tanggal acara aktif belum tersedia'}
                </p>
              </div>
              <Button onClick={() => void handleSaveSettings()} disabled={isSaving}>Save Meta</Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="music" className="rounded-[1.4rem] border border-border bg-card px-5">
            <AccordionTrigger className="py-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Musik</p>
                <p className="text-sm text-muted-foreground mt-1">Pilih mode audio library internal atau link YouTube.</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5 space-y-3">
              <div className="inline-flex rounded-2xl bg-muted p-1">
                {(['none', 'library', 'youtube'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSettingsForm((current) => ({ ...current, musicMode: mode }))}
                    className={cn(
                      'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                      settingsForm.musicMode === mode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
                    )}
                  >
                    {mode === 'none' ? 'Tanpa Musik' : mode === 'library' ? 'Audio Library' : 'YouTube'}
                  </button>
                ))}
              </div>
              {settingsForm.musicMode !== 'none' && (
                settingsForm.musicMode === 'library' ? (
                  <select
                    value={settingsForm.musicValue}
                    onChange={(event) => setSettingsForm((current) => ({ ...current, musicValue: event.target.value }))}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                  >
                    <option value="">Musik default tema</option>
                    {(workspace.settings.musicLibrary ?? []).map((item) => (
                      <option key={item.id} value={item.url}>
                        {item.themeName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <Input value={settingsForm.musicValue} onChange={(event) => setSettingsForm((current) => ({ ...current, musicValue: event.target.value }))} placeholder="Link YouTube" className="h-11 rounded-xl" />
                    {!isPlayableYoutubeUrl(settingsForm.musicValue) ? (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Link YouTube tidak dapat divalidasi. Jika tidak bisa diputar di undangan, sistem akan memakai musik default tema.
                      </div>
                    ) : null}
                  </>
                )
              )}
              <Button onClick={() => void handleSaveSettings()} disabled={isSaving}>Save Music</Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="extra-link" className="rounded-[1.4rem] border border-border bg-card px-5">
            <AccordionTrigger className="py-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Extra Link</p>
                <p className="text-sm text-muted-foreground mt-1">Tambahkan link YouTube untuk video prewedding atau konten tambahan.</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5 space-y-3">
              <Input value={settingsForm.extraYoutube} onChange={(event) => setSettingsForm((current) => ({ ...current, extraYoutube: event.target.value }))} placeholder="https://youtube.com/..." className="h-11 rounded-xl" />
              <Button onClick={() => void handleSaveSettings()} disabled={isSaving}>Save Extra Link</Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="gift" className="rounded-[1.4rem] border border-border bg-card px-5">
            <AccordionTrigger className="py-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Hadiah</p>
                <p className="text-sm text-muted-foreground mt-1">Atur rekening dan alamat pengiriman kado.</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5 space-y-4">
              <div className="rounded-2xl bg-muted/35 p-4 space-y-3">
                <Label className="text-sm font-medium text-foreground">Alamat Pengiriman Kado</Label>
                <Textarea
                  value={settingsForm.giftAddress}
                  onChange={(event) => setSettingsForm((current) => ({ ...current, giftAddress: event.target.value }))}
                  placeholder="Nama penerima, alamat lengkap, nomor rumah, kecamatan, kota, kode pos."
                  className="min-h-24 rounded-xl bg-background"
                />
              </div>
              {settingsForm.giftAccounts.map((account, index) => (
                <div key={`${account.bankName}-${index}`} className="rounded-2xl bg-muted/35 p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input value={account.accountNumber} onChange={(event) => {
                      const next = [...settingsForm.giftAccounts]
                      next[index] = { ...account, accountNumber: event.target.value }
                      setSettingsForm((current) => ({ ...current, giftAccounts: next }))
                    }} placeholder="Nomor rekening" className="h-11 rounded-xl bg-background" />
                    <Input value={account.bankName} onChange={(event) => {
                      const next = [...settingsForm.giftAccounts]
                      next[index] = { ...account, bankName: event.target.value }
                      setSettingsForm((current) => ({ ...current, giftAccounts: next }))
                    }} placeholder="Nama bank" className="h-11 rounded-xl bg-background" />
                    <Input value={account.accountHolder} onChange={(event) => {
                      const next = [...settingsForm.giftAccounts]
                      next[index] = { ...account, accountHolder: event.target.value }
                      setSettingsForm((current) => ({ ...current, giftAccounts: next }))
                    }} placeholder="Atas nama" className="h-11 rounded-xl bg-background" />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  disabled={settingsForm.giftAccounts.length >= 2}
                  onClick={() => setSettingsForm((current) => ({ ...current, giftAccounts: [...current.giftAccounts, createEmptyGiftAccount()].slice(0, 2) }))}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Rekening
                </Button>
                <Button onClick={() => void handleSaveSettings()} disabled={isSaving}>Save Hadiah</Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="message-link" className="rounded-[1.4rem] border border-border bg-card px-5">
            <AccordionTrigger className="py-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Message</p>
                <p className="text-sm text-muted-foreground mt-1">{workspace.messages.length} pesan masuk</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <Button variant="outline" onClick={() => navigate(`/cms/sapatamu/${invitationId}/messages`)}>
                Lihat Halaman Message
              </Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rsvp-link" className="rounded-[1.4rem] border border-border bg-card px-5">
            <AccordionTrigger className="py-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">RSVP</p>
                <p className="text-sm text-muted-foreground mt-1">{workspace.rsvp.attendingCount} attending • {workspace.rsvp.notAttendingCount} not attending</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <Button variant="outline" onClick={() => navigate(`/cms/sapatamu/${invitationId}/rsvp`)}>
                Lihat Halaman RSVP
              </Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="history" className="rounded-[1.4rem] border border-border bg-card px-5">
            <AccordionTrigger className="py-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">History</p>
                <p className="text-sm text-muted-foreground mt-1">Riwayat perubahan invitation dan aktivasi paket.</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5 space-y-3">
              {history.length ? history.map((item) => (
                <div key={item.id} className="rounded-2xl bg-muted/35 p-4">
                  <p className="text-sm text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatHumanDate(item.createdAt)}</p>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Belum ada riwayat perubahan.
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Button variant="outline" onClick={() => navigate(workspace.settings.helpPath)}>
            <Link2 className="w-4 h-4 mr-2" />
            Bantuan
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Invitation
          </Button>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'send':
        return renderSendTab()
      case 'bride-groom':
        return renderBrideGroomTab()
      case 'events':
        return renderEventsTab()
      case 'album':
        return renderAlbumTab()
      case 'rsvp':
        return renderRsvpTab()
      case 'messages':
        return renderMessagesTab()
      case 'settings':
        return renderSettingsTab()
      default:
        return renderSendTab()
    }
  }

  return (
    <CmsLayout
      sidebarLinks={CMS_SIDEBAR_LINKS.general}
      title="Manage Invitation"
      subtitle="Kelola send, pasangan, acara, album, RSVP, message, dan setting dari satu workspace."
    >
      <div className="space-y-6">
        {error && <ErrorNotice message={error} />}
        {isLoading || !workspace ? (
          <div className="rounded-[1.6rem] border border-border bg-card p-6 text-sm text-muted-foreground">
            Memuat workspace invitation...
          </div>
        ) : (
          <>
            {renderHeader()}
            {renderContent()}
          </>
        )}
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus invitation?</DialogTitle>
            <DialogDescription>
              Invitation akan dihapus dari dashboard dan link publiknya tidak bisa digunakan lagi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Batal</Button>
            <Button variant="destructive" onClick={() => void handleDeleteInvitation()} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ya, Hapus Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Paket Undangan</DialogTitle>
            <DialogDescription>
              Lihat paket aktif dan opsi upgrade yang tersedia untuk invitation ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {workspace?.settings.packageOverview.currentPackage && (
              <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Paket aktif</p>
                <p className="text-lg font-semibold text-foreground mt-2">{workspace.settings.packageOverview.currentPackage.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{formatRupiah(workspace.settings.packageOverview.currentPackage.price)}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {workspace.settings.packageOverview.currentPackage.code === 'sapatamu-basic'
                    ? 'Masa aktif 1 tahun'
                    : 'Masa aktif selamanya'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workspace?.settings.packageOverview.activationOffers.map((pkg) => (
                <div key={pkg.id} className="rounded-2xl border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-foreground">{pkg.name}</p>
                    <Badge className="border-0 bg-muted text-foreground">{pkg.packageType}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  <p className="text-xl font-semibold text-foreground">{formatRupiah(pkg.price)}</p>
                  <p className="text-xs text-muted-foreground">Kuota foto {String(pkg.features?.photoQuota ?? '-')} foto</p>
                  <p className="text-xs text-muted-foreground">
                    {pkg.code === 'sapatamu-basic' ? 'Masa aktif 1 tahun' : 'Masa aktif selamanya'}
                  </p>
                  <Button className="w-full" onClick={() => navigate(`/cms/sapatamu/${invitationId}/activate`)}>
                    Lanjutkan Aktivasi
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAlbumDialog} onOpenChange={setShowAlbumDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Kuota Foto</DialogTitle>
            <DialogDescription>
              Pilih add-on foto lalu lanjutkan ke keranjang dan checkout.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspace?.album.addOnPackages.map((pkg) => (
              <div key={pkg.id} className="rounded-2xl border border-border p-4 space-y-3">
                <p className="text-lg font-semibold text-foreground">{pkg.name}</p>
                <p className="text-sm text-muted-foreground">{pkg.description}</p>
                <p className="text-xl font-semibold text-foreground">{formatRupiah(pkg.price)}</p>
                <p className="text-xs text-muted-foreground">Tambahan {String(pkg.features?.quantity ?? '-')} foto</p>
                <Button className="w-full" onClick={() => void startAddOnCheckout(pkg)}>
                  Add to Cart
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </CmsLayout>
  )
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.6rem] border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-semibold text-foreground mt-3">{value}</p>
    </div>
  )
}
