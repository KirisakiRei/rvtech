import { BRAND, WEDDING_THEMES } from '@/lib/constants'
import type {
  DraftWizardState,
  SapatamuEvent,
  SapatamuProfile,
  SapatamuThemeCatalogItem,
  TierCategory,
  WorkspaceGuest,
  SapatamuWorkspace,
} from '@/types/sapatamu'

export const DEFAULT_PREFACE_TEMPLATE = `Assalamu'alaikum Warahmatullahi Wabarakaatuh

Kepada Yth. Bapak/Ibu {{guest-name}}

Dengan penuh rasa syukur, kami ingin menyampaikan kabar bahagia atas pernikahan kami:

{{full-name-1}} & {{full-name-2}}

InsyaAllah akan dilaksanakan pada:

{{event-name-1}}: {{event-date-1}}
Pukul {{time-start-1}} {{event-timezone-1}}
{{event-location-1}}

{{event-name-2}}: {{event-date-2}}
Pukul {{time-start-2}} - {{time-end-2}} {{event-timezone-2}}
{{event-location-2}}

Link Undangan: {{link}}

Doa restu Bapak/Ibu menjadi kebahagiaan besar bagi kami.

Wassalamu'alaikum Warahmatullahi Wabarakaatuh
{{nick-name-1}} & {{nick-name-2}}`

export function createDefaultProfiles(): SapatamuProfile[] {
  return [
    { id: 'profile-1', label: 'Profile 1', fullName: '', nickName: '', description: '' },
    { id: 'profile-2', label: 'Profile 2', fullName: '', nickName: '', description: '' },
  ]
}

export function createDefaultEvents(): SapatamuEvent[] {
  return [
    {
      id: 'event-1',
      name: 'Akad',
      date: '',
      timeStart: '',
      timeEnd: '',
      timeZone: 'WIB',
      address: '',
      mapLocation: '',
      enabled: true,
    },
    {
      id: 'event-2',
      name: 'Resepsi',
      date: '',
      timeStart: '',
      timeEnd: '',
      timeZone: 'WIB',
      address: '',
      mapLocation: '',
      enabled: true,
    },
  ]
}

export function createDefaultDraftState(): DraftWizardState {
  return {
    step: 0,
    invitationName: '',
    slugCandidate: '',
    themeId: '',
    selectedPackageId: null,
    profiles: createDefaultProfiles(),
    events: createDefaultEvents(),
  }
}

export function buildSlugPreview(slug: string): string {
  return `${BRAND.domain}/${slug || 'nama-link-anda'}`
}

export function formatHumanDate(date: string): string {
  if (!date) return '-'

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date

  return parsed.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function resolveThemeTier(theme: SapatamuThemeCatalogItem | undefined): 'Basic' | 'Signature' | 'Vintage' {
  const tierCategory = typeof theme?.metadata?.tierCategory === 'string' ? theme.metadata.tierCategory : ''
  if (tierCategory === 'premium') return 'Signature'
  if (tierCategory === 'vintage') return 'Vintage'
  return 'Basic'
}

export function resolveThemeTierCategory(theme: SapatamuThemeCatalogItem | undefined): TierCategory {
  const tierCategory = typeof theme?.metadata?.tierCategory === 'string' ? theme.metadata.tierCategory : ''
  if (tierCategory === 'premium' || tierCategory === 'vintage') return tierCategory
  return 'basic'
}

export function resolveThemeReleaseStatus(theme: SapatamuThemeCatalogItem | undefined): 'available' | 'comingSoon' {
  const releaseStatus = theme?.metadata?.releaseStatus
  if (releaseStatus === 'available' || releaseStatus === 'comingSoon') return releaseStatus
  return resolveThemeTierCategory(theme) === 'premium' ? 'available' : 'comingSoon'
}

export function isThemeComingSoon(theme: SapatamuThemeCatalogItem | undefined) {
  return resolveThemeReleaseStatus(theme) === 'comingSoon'
}

export function getThemeReleaseLabel(theme: SapatamuThemeCatalogItem | undefined) {
  const label = theme?.metadata?.availabilityLabel
  if (typeof label === 'string' && label.trim()) return label
  return isThemeComingSoon(theme) ? 'Coming soon' : 'Available'
}

export function resolveThemeGroup(theme: SapatamuThemeCatalogItem) {
  return resolveThemeTier(theme)
}

export function getThemePreset(code: string) {
  return WEDDING_THEMES.find((item) => item.id === code) ?? WEDDING_THEMES[0]
}

export function buildInvitationLabel(profiles: SapatamuProfile[]): string {
  const left = profiles[0]?.nickName || profiles[0]?.fullName || 'Profile 1'
  const right = profiles[1]?.nickName || profiles[1]?.fullName || 'Profile 2'
  return `${left} & ${right}`
}

export function resolveTemplateTokens(
  template: string,
  values: Record<string, string>,
) {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, token: string) => values[token] ?? `{{${token}}}`)
}

export function buildMetadataTitle(workspace: SapatamuWorkspace): string {
  return (
    resolveTemplateTokens(workspace.settings.meta.titleTemplate, {
      'nick-name-1': workspace.profiles[0]?.nickName || workspace.profiles[0]?.fullName || 'Mempelai 1',
      'nick-name-2': workspace.profiles[1]?.nickName || workspace.profiles[1]?.fullName || 'Mempelai 2',
      'full-name-1': workspace.profiles[0]?.fullName || workspace.profiles[0]?.nickName || 'Mempelai 1',
      'full-name-2': workspace.profiles[1]?.fullName || workspace.profiles[1]?.nickName || 'Mempelai 2',
    }) || `The Wedding of ${buildInvitationLabel(workspace.profiles)}`
  )
}

function resolveEvent(events: SapatamuEvent[], id: string): SapatamuEvent | undefined {
  return events.find((item) => item.id === id) ?? events[0]
}

export function resolvePrefaceTemplate(
  template: string,
  profiles: SapatamuProfile[],
  events: SapatamuEvent[],
  link: string,
  guest?: WorkspaceGuest,
) {
  const event1 = resolveEvent(events, 'event-1')
  const event2 = resolveEvent(events, 'event-2')

  return template
    .replaceAll('{{guest-name}}', guest?.name || 'Tamu Undangan')
    .replaceAll('{{full-name-1}}', profiles[0]?.fullName || '-')
    .replaceAll('{{full-name-2}}', profiles[1]?.fullName || '-')
    .replaceAll('{{nick-name-1}}', profiles[0]?.nickName || profiles[0]?.fullName || '-')
    .replaceAll('{{nick-name-2}}', profiles[1]?.nickName || profiles[1]?.fullName || '-')
    .replaceAll('{{event-name-1}}', event1?.name || '-')
    .replaceAll('{{event-name-2}}', event2?.name || '-')
    .replaceAll('{{event-date-1}}', event1?.date ? formatHumanDate(event1.date) : '-')
    .replaceAll('{{event-date-2}}', event2?.date ? formatHumanDate(event2.date) : '-')
    .replaceAll('{{time-start-1}}', event1?.timeStart || '-')
    .replaceAll('{{time-start-2}}', event2?.timeStart || '-')
    .replaceAll('{{time-end-1}}', event1?.timeEnd || '-')
    .replaceAll('{{time-end-2}}', event2?.timeEnd || '-')
    .replaceAll('{{event-timezone-1}}', event1?.timeZone || '-')
    .replaceAll('{{event-timezone-2}}', event2?.timeZone || '-')
    .replaceAll('{{event-location-1}}', event1?.address || '-')
    .replaceAll('{{event-location-2}}', event2?.address || '-')
    .replaceAll('{{link}}', guest?.personalizedUrl || link)
}

export function buildGuestWhatsappUrl(
  template: string,
  workspace: SapatamuWorkspace,
  guest: WorkspaceGuest,
) {
  const message = resolvePrefaceTemplate(
    template,
    workspace.profiles,
    workspace.events,
    workspace.invitation.publicUrl,
    guest,
  )

  return `https://wa.me/?text=${encodeURIComponent(message)}`
}
