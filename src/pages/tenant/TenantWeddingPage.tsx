import { type CSSProperties, type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, Heart, Send, ChevronDown, Music, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { resolveApiAssetUrl } from '@/lib/api'
import { BRAND, WEDDING_THEMES } from '@/lib/constants'
import { dataCreate, dataDetail, dataList } from '@/lib/api'
import type { WeddingDetail, WeddingThemeId } from '@/types/wedding'

type InvitationRow = {
  id: string
  title: string
  bride_name: string | null
  groom_name: string | null
  event_date: string | null
  status: 'draft' | 'published' | 'archived'
}

type InvitationSlugRow = {
  invitation_id: string
  slug: string
}

type InvitationContentRow = {
  content_json: {
    selectedTheme?: WeddingThemeId
    weddingData?: Partial<WeddingDetail>
  }
}

type InvitationMediaRow = {
  id: string
  url: string
  sort_order: number
}

const DEFAULT_WEDDING_DATA: Partial<WeddingDetail> = {
  brideName: '',
  groomName: '',
  brideParents: '',
  groomParents: '',
  akadTime: '',
  akadLocation: '',
  resepsiTime: '',
  resepsiLocation: '',
  loveStory: '',
  bgmUrl: '',
  bankAccountInfo: [],
}

const RSVP_OPTIONS = [
  { value: 'hadir', label: 'Hadir' },
  { value: 'tidak', label: 'Tidak Hadir' },
  { value: 'ragu', label: 'Ragu-ragu' },
] as const

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const target = new Date(targetDate).getTime()
    const timer = setInterval(() => {
      const now = Date.now()
      const diff = Math.max(0, target - now)
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex justify-center gap-4">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className="text-center">
          <div className="text-2xl sm:text-3xl font-heading price-text">{value}</div>
          <div className="text-[10px] uppercase tracking-[0.15em] opacity-50 mt-1">
            {label === 'days' ? 'Hari' : label === 'hours' ? 'Jam' : label === 'minutes' ? 'Menit' : 'Detik'}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TenantWeddingPage() {
  const { slug = '' } = useParams()
  const [searchParams] = useSearchParams()
  const guestName = searchParams.get('to') || 'Tamu Undangan'
  const mainRef = useRef<HTMLDivElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [invitationId, setInvitationId] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<WeddingThemeId>('floral')
  const [weddingData, setWeddingData] = useState<Partial<WeddingDetail>>(DEFAULT_WEDDING_DATA)
  const [gallery, setGallery] = useState<InvitationMediaRow[]>([])
  const [rsvpStatus, setRsvpStatus] = useState<'hadir' | 'tidak' | 'ragu' | ''>('')
  const [rsvpName, setRsvpName] = useState(guestName)
  const [rsvpMessage, setRsvpMessage] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const theme = useMemo(
    () => WEDDING_THEMES.find((item) => item.id === selectedTheme) || WEDDING_THEMES[0],
    [selectedTheme],
  )

  useEffect(() => {
    setRsvpName(guestName)
  }, [guestName])

  useEffect(() => {
    if (!slug) {
      setError('Slug undangan tidak ditemukan.')
      setIsLoading(false)
      return
    }

    const loadInvitation = async () => {
      setIsLoading(true)
      setError('')

      try {
        const slugResponse = await dataList<InvitationSlugRow>('invitation-slugs', {
          where: { slug, is_primary: true },
          limit: 1,
        })

        const slugRow = slugResponse.data?.items?.[0]
        if (!slugRow?.invitation_id) {
          throw new Error('Undangan tidak ditemukan')
        }

        const invitationResponse = await dataDetail<InvitationRow>('invitations', slugRow.invitation_id)
        const [contentResponse, mediaResponse] = await Promise.all([
          dataList<InvitationContentRow>('invitation-contents', {
            where: { invitation_id: slugRow.invitation_id, is_current: true },
            orderBy: { version: 'desc' },
            limit: 1,
          }),
          dataList<InvitationMediaRow>('invitation-media', {
            where: { invitation_id: slugRow.invitation_id, media_type: 'image' },
            orderBy: { sort_order: 'asc' },
            limit: 20,
          }),
        ])

        const invitation = invitationResponse.data
        if (!invitation || invitation.status !== 'published') {
          setInvitationId(slugRow.invitation_id)
          setGallery([])
          setWeddingData(DEFAULT_WEDDING_DATA)
          setError('Undangan ini belum aktif. Silakan kembali lagi setelah pemilik mengaktifkannya.')
          return
        }
        const content = contentResponse.data?.items?.[0]?.content_json
        const contentWeddingData = content?.weddingData ?? {}

        setInvitationId(slugRow.invitation_id)
        setSelectedTheme(content?.selectedTheme ?? 'floral')
        setGallery(mediaResponse.data?.items ?? [])
        setWeddingData({
          ...DEFAULT_WEDDING_DATA,
          ...contentWeddingData,
          brideName: contentWeddingData.brideName ?? invitation?.bride_name ?? '',
          groomName: contentWeddingData.groomName ?? invitation?.groom_name ?? '',
          akadTime: contentWeddingData.akadTime ?? invitation?.event_date ?? '',
        })

        void dataCreate('invitation-visits', {
          invitation_id: slugRow.invitation_id,
          source: 'public-page',
          user_agent: navigator.userAgent,
          visitor_hash: `${slug}:${guestName}`.slice(0, 180),
        }).catch(() => undefined)
      } catch {
        setInvitationId(null)
        setGallery([])
        setWeddingData(DEFAULT_WEDDING_DATA)
        setError('Undangan tidak tersedia atau belum dipublikasikan.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadInvitation()
  }, [guestName, slug])

  const handleOpen = () => {
    setIsOpen(true)
    setIsMuted(false)
    mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleRsvpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!invitationId || !rsvpStatus || !rsvpName) return

    setIsSubmitting(true)

    try {
      await dataCreate('invitation-rsvps', {
        invitation_id: invitationId,
        guest_name: rsvpName,
        status: rsvpStatus,
        attendees_count: 1,
        message: rsvpMessage || null,
      })

      if (rsvpMessage.trim()) {
        await dataCreate('invitation-greetings', {
          invitation_id: invitationId,
          guest_name: rsvpName,
          message: rsvpMessage.trim(),
          is_approved: true,
        })
      }

      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-background" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-card border border-border rounded-[2rem] p-8 text-center">
          <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground">Rekavia Invitation</p>
          <p className="text-2xl font-heading text-foreground mt-3">Undangan Belum Aktif</p>
          <p className="text-sm text-muted-foreground mt-3 leading-7">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={
        {
          '--wedding-primary': theme.primaryColor,
          '--wedding-secondary': theme.secondaryColor,
          '--wedding-accent': theme.accentColor,
        } as CSSProperties
      }
    >
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="cover"
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ backgroundColor: theme.secondaryColor, color: theme.primaryColor }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center px-8 max-w-sm"
            >
              <p className="text-[11px] tracking-[0.2em] uppercase opacity-50 mb-6">The Wedding Of</p>
              <h1 className="text-4xl sm:text-5xl mb-2" style={{ fontFamily: theme.fontHeading }}>
                {weddingData.groomName || 'Mempelai Pria'}
              </h1>
              <p className="text-2xl opacity-40 my-2">&</p>
              <h1 className="text-4xl sm:text-5xl mb-8" style={{ fontFamily: theme.fontHeading }}>
                {weddingData.brideName || 'Mempelai Wanita'}
              </h1>

              <div className="mb-8">
                <p className="text-[11px] tracking-[0.15em] uppercase opacity-40 mb-2">Kepada Yth.</p>
                <p className="text-lg font-medium">{guestName}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpen}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium transition-colors"
                style={{ backgroundColor: theme.primaryColor, color: theme.secondaryColor }}
                id="wedding-open-btn"
              >
                Buka Undangan
                <ChevronDown className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div ref={mainRef} style={{ backgroundColor: theme.secondaryColor, color: theme.primaryColor }}>
          <button
            onClick={() => setIsMuted((value) => !value)}
            className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors"
            style={{ backgroundColor: theme.primaryColor, color: theme.secondaryColor }}
            aria-label={isMuted ? 'Aktifkan musik' : 'Matikan musik'}
            id="wedding-music-toggle"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Music className="w-4 h-4" />}
          </button>

          <section className="min-h-screen flex flex-col items-center justify-center text-center px-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}>
              <p className="text-[11px] tracking-[0.2em] uppercase opacity-50 mb-4">Pernikahan</p>
              <h2 className="text-4xl sm:text-6xl mb-2" style={{ fontFamily: theme.fontHeading }}>
                {weddingData.groomName || 'Mempelai Pria'}
              </h2>
              <div className="flex items-center justify-center gap-4 my-3">
                <div className="h-px w-12 opacity-20" style={{ backgroundColor: theme.primaryColor }} />
                <Heart className="w-5 h-5" style={{ color: theme.accentColor }} />
                <div className="h-px w-12 opacity-20" style={{ backgroundColor: theme.primaryColor }} />
              </div>
              <h2 className="text-4xl sm:text-6xl" style={{ fontFamily: theme.fontHeading }}>
                {weddingData.brideName || 'Mempelai Wanita'}
              </h2>
            </motion.div>
          </section>

          <section className="py-20 px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="max-w-md mx-auto text-center"
            >
              <p className="text-[11px] tracking-[0.15em] uppercase opacity-50 mb-6">Menghitung Hari</p>
              <Countdown targetDate={weddingData.akadTime || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()} />
            </motion.div>
          </section>

          <section className="py-20 px-8">
            <div className="max-w-md mx-auto space-y-8">
              {[
                { label: 'Akad Nikah', time: weddingData.akadTime, location: weddingData.akadLocation },
                { label: 'Resepsi', time: weddingData.resepsiTime, location: weddingData.resepsiLocation },
              ].map((eventItem, index) => (
                <motion.div
                  key={eventItem.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="text-center p-6 rounded-2xl"
                  style={{ backgroundColor: `${theme.primaryColor}06` }}
                >
                  <p className="text-[11px] tracking-[0.15em] uppercase opacity-50 mb-3">{eventItem.label}</p>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-4 h-4 opacity-50" />
                    <p className="text-sm">
                      {eventItem.time
                        ? new Date(eventItem.time).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Tanggal belum diatur'}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4 opacity-50" />
                    <p className="text-sm opacity-80">{eventItem.location || 'Lokasi belum diatur'}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="py-20 px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="max-w-md mx-auto text-center"
            >
              <p className="text-[11px] tracking-[0.15em] uppercase opacity-50 mb-6">Galeri</p>
              <div className="grid grid-cols-2 gap-3">
                {(gallery.length > 0 ? gallery.slice(0, 4) : Array.from({ length: 4 }, () => null)).map((item, index) =>
                  item ? (
                    <img
                      key={item.id}
                      src={resolveApiAssetUrl(item.url)}
                      alt={`Galeri ${index + 1}`}
                      className="aspect-square rounded-xl object-cover w-full"
                    />
                  ) : (
                    <div
                      key={`placeholder-${index}`}
                      className="aspect-square rounded-xl"
                      style={{ backgroundColor: `${theme.primaryColor}08` }}
                    />
                  ),
                )}
              </div>
            </motion.div>
          </section>

          <section className="py-20 px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="max-w-md mx-auto"
            >
              <p className="text-[11px] tracking-[0.15em] uppercase opacity-50 mb-6 text-center">Konfirmasi Kehadiran</p>

              {isSubmitted ? (
                <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: `${theme.primaryColor}06` }}>
                  <Heart className="w-8 h-8 mx-auto mb-3" style={{ color: theme.accentColor }} />
                  <p className="font-medium">Terima kasih.</p>
                  <p className="text-sm opacity-60 mt-1">Konfirmasi Anda telah kami terima.</p>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="space-y-4" id="wedding-rsvp-form">
                  <Input
                    placeholder="Nama Anda"
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    className="h-11 rounded-xl border-opacity-20 bg-transparent"
                    style={{ borderColor: `${theme.primaryColor}30` }}
                    id="wedding-rsvp-name"
                  />

                  <div className="flex gap-2">
                    {RSVP_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRsvpStatus(option.value)}
                        className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: rsvpStatus === option.value ? theme.primaryColor : `${theme.primaryColor}08`,
                          color: rsvpStatus === option.value ? theme.secondaryColor : theme.primaryColor,
                        }}
                        id={`wedding-rsvp-${option.value}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <Textarea
                    placeholder="Kirim ucapan dan doa..."
                    value={rsvpMessage}
                    onChange={(e) => setRsvpMessage(e.target.value)}
                    rows={3}
                    className="rounded-xl border-opacity-20 bg-transparent"
                    style={{ borderColor: `${theme.primaryColor}30` }}
                    id="wedding-rsvp-message"
                  />

                  <Button
                    type="submit"
                    disabled={!rsvpStatus || !rsvpName || isSubmitting}
                    className="w-full h-11 rounded-xl text-sm"
                    style={{ backgroundColor: theme.primaryColor, color: theme.secondaryColor }}
                    id="wedding-rsvp-submit"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Mengirim...' : 'Kirim Konfirmasi'}
                  </Button>
                </form>
              )}
            </motion.div>
          </section>

          <footer className="py-12 text-center opacity-40">
            <p className="text-xs">
              Dibuat dengan {BRAND.name} · {BRAND.domain}
            </p>
          </footer>
        </div>
      )}
    </div>
  )
}
