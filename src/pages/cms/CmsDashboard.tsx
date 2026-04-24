import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  Store,
  Building2,
  GraduationCap,
  Clock3,
  BookOpenText,
  MessageCircleHeart,
  ShieldCheck,
  CircleHelp,
  CopyPlus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CMS_SIDEBAR_LINKS } from '@/lib/constants'
import { sapatamuDeleteDraft } from '@/lib/api'
import { buildInvitationLabel, buildSlugPreview, formatHumanDate, getThemePreset } from '@/lib/sapatamu'
import { useDashboardStore } from '@/stores/dashboardStore'
import { CmsSapatamuCreateWizard } from './sapatamu/CmsSapatamuCreateWizard'
import { ErrorNotice } from '@/components/feedback/ErrorNotice'

const CREATE_PRODUCTS = [
  {
    id: 'sapatamu',
    label: 'SapaTamu',
    description: 'Buat undangan digital baru dan lanjutkan ke workspace manajemen.',
    color: 'from-emerald-500 to-teal-500',
    icon: Heart,
    href: '/cms/create/sapatamu',
    comingSoon: false,
  },
  {
    id: 'etalasepro',
    label: 'EtalasePro',
    description: 'Segera hadir untuk katalog dan etalase online.',
    color: 'from-violet-500 to-fuchsia-500',
    icon: Store,
    comingSoon: true,
  },
  {
    id: 'citrakorpora',
    label: 'CitraKorpora',
    description: 'Segera hadir untuk website company profile.',
    color: 'from-amber-500 to-orange-500',
    icon: Building2,
    comingSoon: true,
  },
  {
    id: 'edugerbang',
    label: 'EduGerbang',
    description: 'Segera hadir untuk website sekolah dan institusi.',
    color: 'from-sky-500 to-cyan-500',
    icon: GraduationCap,
    comingSoon: true,
  },
] as const

const HELP_ITEMS = [
  { label: 'Tutorial Videos', description: 'Panduan mulai cepat dari create sampai aktivasi undangan.', icon: BookOpenText },
  { label: 'User Guide', description: 'Pelajari workspace send, event, album, message, dan setting.', icon: CircleHelp },
  { label: 'Customer Support', description: 'Hubungi tim support untuk kebutuhan operasional undangan.', icon: MessageCircleHeart },
  { label: 'Privacy Policy', description: 'Kebijakan penggunaan data tamu dan pesan undangan.', icon: ShieldCheck },
] as const

function WorkspaceCard({
  title,
  slug,
  packageName,
  themeCode,
  updatedAt,
  statusLabel,
  statusTone,
  manageLabel,
  onManage,
  onSecondary,
  secondaryLabel,
}: {
  title: string
  slug: string
  packageName: string
  themeCode: string
  updatedAt: string
  statusLabel: string
  statusTone: 'accent' | 'warning'
  manageLabel: string
  onManage: () => void
  onSecondary?: () => void
  secondaryLabel?: string
}) {
  const theme = getThemePreset(themeCode)

  return (
    <div className="rounded-[1.7rem] border border-border bg-card overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-5 lg:p-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-foreground truncate">{title}</h3>
            <Badge className={statusTone === 'accent' ? 'border-0 bg-accent/10 text-accent' : 'border-0 bg-warning/10 text-warning'}>
              {statusLabel}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{buildSlugPreview(slug)}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge className="border-0 bg-muted text-foreground">{packageName}</Badge>
            <span className="text-xs text-muted-foreground">Tema {theme.name}</span>
            <span className="text-xs text-muted-foreground">Diperbarui {formatHumanDate(updatedAt)}</span>
          </div>
        </div>
        <div
          className="w-20 h-20 rounded-[1.4rem] shrink-0"
          style={{
            background: `linear-gradient(145deg, ${theme.secondaryColor}, ${theme.primaryColor}1f)`,
          }}
        />
      </div>

      <div className={`grid ${onSecondary ? 'grid-cols-2' : 'grid-cols-1'} border-t border-border/70`}>
        <button
          type="button"
          onClick={onManage}
          className="px-5 py-4 text-left hover:bg-muted/40 transition-colors"
        >
          <p className="text-sm font-semibold text-foreground">{manageLabel}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {manageLabel === 'Manage' ? 'Masuk ke workspace operasional invitation' : 'Buka invitation editor untuk preview internal'}
          </p>
        </button>
        {onSecondary && secondaryLabel && (
          <button
            type="button"
            onClick={onSecondary}
            className="px-5 py-4 text-left border-l border-border/70 hover:bg-muted/40 transition-colors"
          >
            <p className="text-sm font-semibold text-foreground">{secondaryLabel}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {secondaryLabel === 'Aktifkan Undangan'
                ? 'Pilih paket lalu lanjutkan ke cart dan checkout'
                : 'Masuk ke editor web invitation'}
            </p>
          </button>
        )}
      </div>
    </div>
  )
}

export function CmsDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { home, isLoading, error, loadHome } = useDashboardStore()
  const [draftToDelete, setDraftToDelete] = useState<{ id: string; label: string } | null>(null)
  const [isDeletingDraft, setIsDeletingDraft] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    void loadHome()
  }, [loadHome])

  const isWizardOpen = location.pathname === '/cms/create/sapatamu'
  const activeInvitations = home?.activeInvitations ?? []
  const needsActivation = home?.needsActivation ?? []
  const drafts = home?.drafts ?? []

  const draftCountLabel = useMemo(() => `${drafts.length} draft`, [drafts.length])

  const handleDeleteDraft = async () => {
    if (!draftToDelete) return

    setIsDeletingDraft(true)
    setDeleteError(null)
    try {
      await sapatamuDeleteDraft(draftToDelete.id)
      await loadHome()
      setDraftToDelete(null)
    } catch {
      setDeleteError('Draft belum bisa dihapus. Coba beberapa saat lagi.')
    } finally {
      setIsDeletingDraft(false)
    }
  }

  return (
    <CmsLayout
      sidebarLinks={CMS_SIDEBAR_LINKS.general}
      title="Dashboard"
      subtitle="Buat invitation baru, kelola yang aktif, dan lanjutkan undangan yang masih menunggu aktivasi."
    >
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_360px] gap-8">
        <div className="space-y-8">
          <section className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Create New</p>
              <h2 className="text-2xl font-semibold text-foreground">Layanan apa yang ingin Anda mulai hari ini?</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {CREATE_PRODUCTS.map((item, index) => (
                <motion.button
                  key={item.id}
                  type="button"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                  onClick={() => !item.comingSoon && navigate(item.href!)}
                  className="text-left rounded-[1.8rem] border border-border bg-card p-5 hover:-translate-y-1 transition-transform disabled:cursor-not-allowed"
                  disabled={item.comingSoon}
                >
                  <div className={`w-16 h-16 rounded-[1.2rem] bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-5`}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-foreground">{item.label}</h3>
                    {item.comingSoon && <Badge className="border-0 bg-muted text-muted-foreground">Coming Soon</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                </motion.button>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">My Invitations</p>
              <h2 className="text-2xl font-semibold text-foreground">Invitation aktif, yang perlu diaktifkan, dan draft yang masih berjalan</h2>
            </div>

            {error && <ErrorNotice message={error} />}

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Active Invitations</h3>
                <Badge className="border-0 bg-card text-foreground">{activeInvitations.length}</Badge>
              </div>

              {isLoading ? (
                <div className="rounded-[1.6rem] border border-border bg-card p-6 text-sm text-muted-foreground">
                  Memuat invitation aktif...
                </div>
              ) : activeInvitations.length ? (
                <div className="space-y-4">
                  {activeInvitations.map((invitation) => (
                    <WorkspaceCard
                      key={invitation.id}
                      title={buildInvitationLabel(invitation.profiles)}
                      slug={invitation.slug}
                      packageName={invitation.packageName}
                      themeCode={invitation.themeCode}
                      updatedAt={invitation.updatedAt}
                      statusLabel="Aktif"
                      statusTone="accent"
                      manageLabel="Manage"
                      onManage={() => navigate(`/cms/sapatamu/${invitation.id}/send`)}
                      onSecondary={() => navigate(`/cms/sapatamu/${invitation.id}/editor`)}
                      secondaryLabel="Edit Web"
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.6rem] border border-dashed border-border bg-card p-8">
                  <p className="text-base font-semibold text-foreground">Belum ada invitation aktif.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Mulai dengan membuat SapaTamu baru, lengkapi data undangan, lalu aktifkan saat sudah siap dipublikasikan.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Needs Activation</h3>
                <Badge className="border-0 bg-card text-foreground">{needsActivation.length}</Badge>
              </div>

              {needsActivation.length ? (
                <div className="space-y-4">
                  {needsActivation.map((invitation) => (
                    <WorkspaceCard
                      key={invitation.id}
                      title={buildInvitationLabel(invitation.profiles)}
                      slug={invitation.slug}
                      packageName={invitation.packageName}
                      themeCode={invitation.themeCode}
                      updatedAt={invitation.updatedAt}
                      statusLabel="Belum Aktif"
                      statusTone="warning"
                      manageLabel="Manage"
                      onManage={() => navigate(`/cms/sapatamu/${invitation.id}/send`)}
                      onSecondary={() => navigate(`/cms/sapatamu/${invitation.id}/activate`)}
                      secondaryLabel="Aktifkan Undangan"
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.6rem] border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                  Tidak ada invitation yang menunggu aktivasi saat ini.
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Drafts</h3>
                  <p className="text-xs text-muted-foreground mt-1">{draftCountLabel}</p>
                </div>
                <Badge className="border-0 bg-card text-foreground">{drafts.length}</Badge>
              </div>

              {drafts.length ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {drafts.map((draft) => (
                    <div key={draft.id} className="rounded-[1.6rem] border border-border bg-card p-5 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-foreground">
                            {buildInvitationLabel(draft.profiles)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {buildSlugPreview(draft.slugCandidate)}
                          </p>
                        </div>
                        <Badge className="border-0 bg-warning/10 text-warning">
                          Step {draft.step + 1}
                        </Badge>
                      </div>

                      <div className="rounded-2xl bg-muted/35 p-4 space-y-2">
                        <p className="text-sm text-foreground font-medium">{draft.theme?.name ?? 'Tema belum dipilih'}</p>
                        <p className="text-xs text-muted-foreground">Diperbarui {formatHumanDate(draft.updatedAt)}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={() => setDraftToDelete({ id: draft.id, label: buildInvitationLabel(draft.profiles) })}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus Draft
                        </Button>
                        <Button onClick={() => navigate(`/cms/create/sapatamu?draft=${draft.id}`)}>
                          Lanjutkan Draft
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.6rem] border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                  Tidak ada draft tertunda saat ini.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] overflow-hidden border border-border bg-gradient-to-br from-rose-100 via-pink-100 to-orange-100 p-6">
            <p className="text-sm uppercase tracking-[0.14em] text-foreground/55">Activation Flow</p>
            <h3 className="text-2xl font-semibold text-foreground mt-2">Buat dulu invitation Anda, aktifkan saat siap dipublikasikan.</h3>
            <p className="text-sm text-foreground/70 mt-3">
              Sekarang invitation bisa dibuat dan dikelola terlebih dahulu. Link publik baru aktif setelah paket dibayar.
            </p>
            <Button className="mt-5" onClick={() => navigate('/cms/create/sapatamu')}>
              <CopyPlus className="w-4 h-4 mr-2" />
              Buat SapaTamu Baru
            </Button>
          </div>

          <div className="rounded-[1.6rem] border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <p className="text-sm font-semibold text-foreground">Workspace Rule</p>
            </div>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p>1. Buat invitation terlebih dahulu lewat wizard.</p>
              <p>2. Kelola profil, event, album, dan pesan dari workspace manage.</p>
              <p>3. Klik aktivasi saat undangan siap dipublikasikan ke tamu.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpenText className="w-4 h-4 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">Help</h3>
            </div>

            {HELP_ITEMS.map((item) => (
              <div key={item.label} className="rounded-[1.4rem] border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[1.6rem] border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Clock3 className="w-4 h-4 text-accent" />
              <p className="text-sm font-semibold text-foreground">Recent Activity</p>
            </div>
            <div className="mt-4 space-y-3">
              {home?.recentActivity.length ? (
                home.recentActivity.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-muted/35 p-3">
                    <p className="text-sm text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatHumanDate(item.createdAt)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Aktivitas terbaru akan muncul setelah Anda mulai membuat invitation.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {isWizardOpen && (
        <CmsSapatamuCreateWizard
          onClose={() => {
            void loadHome()
            navigate('/cms')
          }}
        />
      )}

      <Dialog open={Boolean(draftToDelete)} onOpenChange={(open) => !open && setDraftToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus draft undangan?</DialogTitle>
            <DialogDescription>
              {draftToDelete
                ? `Draft ${draftToDelete.label} akan dihapus dari daftar pending payment/draft.`
                : 'Draft ini akan dihapus permanen dari dashboard.'}
            </DialogDescription>
          </DialogHeader>

          {deleteError && <ErrorNotice message={deleteError} />}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDraftToDelete(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => void handleDeleteDraft()} disabled={isDeletingDraft}>
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeletingDraft ? 'Menghapus...' : 'Ya, Hapus Draft'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CmsLayout>
  )
}
