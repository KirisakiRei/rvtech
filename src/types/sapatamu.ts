export type SapatamuProductStatus = 'draft' | 'published' | 'archived'
export type DraftStatus = 'in_progress' | 'pending_payment' | 'converted' | 'cancelled' | 'expired'
export type SendStatus = 'draft' | 'copied' | 'sent'
export type MusicMode = 'none' | 'library' | 'youtube'
export type ActivationState = 'active' | 'needs_activation'
export type TierCategory = 'basic' | 'premium' | 'vintage'

export interface SapatamuProfile {
  id: string
  label: string
  fullName: string
  nickName: string
  description: string
}

export interface SapatamuEvent {
  id: string
  name: string
  date: string
  timeStart: string
  timeEnd: string
  timeZone: 'WIB' | 'WITA' | 'WIT'
  address: string
  mapLocation: string
  enabled: boolean
}

export interface SapatamuThemeCatalogItem {
  id: string
  code: string
  name: string
  description: string | null
  previewImageUrl: string | null
  metadata?: Record<string, unknown>
}

export interface SapatamuPackageCatalogItem {
  id: string
  code: string
  name: string
  description: string | null
  price: number
  currency: string
  packageType: 'base' | 'upgrade' | 'add_on'
  features?: Record<string, unknown> | null
}

export interface DashboardInvitationSummary {
  id: string
  title: string
  status: SapatamuProductStatus
  activationState: ActivationState
  slug: string
  createdAt: string
  updatedAt: string
  packageName: string
  packageCode: string
  themeCode: string
  profiles: SapatamuProfile[]
}

export interface DashboardDraftSummary {
  id: string
  slugCandidate: string
  status: DraftStatus
  createdAt: string
  updatedAt: string
  step: number
  selectedPackage: { id: string; name: string; code: string } | null
  theme: { id: string; name: string; code: string } | null
  profiles: SapatamuProfile[]
}

export interface DashboardActivity {
  id: string
  label: string
  createdAt: string
}

export interface CmsHomeData {
  productScope: string
  activeInvitations: DashboardInvitationSummary[]
  needsActivation: DashboardInvitationSummary[]
  drafts: DashboardDraftSummary[]
  recentActivity: DashboardActivity[]
  catalog: {
    themes: SapatamuThemeCatalogItem[]
    packages: SapatamuPackageCatalogItem[]
  }
}

export interface DraftWizardState {
  step: number
  slugCandidate: string
  themeId: string
  selectedPackageId: string | null
  profiles: SapatamuProfile[]
  events: SapatamuEvent[]
}

export interface SapatamuDraftPayload {
  id: string
  slugCandidate: string
  status: DraftStatus
  themeId: string | null
  selectedPackageId: string | null
  wizard: DraftWizardState
}

export interface WorkspaceGuest {
  id: string
  name: string
  phoneNumber: string | null
  sendStatus: SendStatus
  lastSentAt: string | null
  personalizedUrl: string
}

export interface WorkspaceInvitationSummary {
  id: string
  title: string
  status: SapatamuProductStatus
  slug: string
  publicUrl: string
  previewUrl: string
  canPublicOpen: boolean
  activationState: ActivationState
  requiredTierCategory: TierCategory
  package: {
    id: string
    code: string
    name: string
    price: number
    packageType: 'base' | 'upgrade' | 'add_on'
  } | null
  theme: {
    id: string
    code: string
    name: string
  } | null
  currentVersion: number
  updatedAt: string
}

export interface WorkspaceAlbumItem {
  id: string
  url: string
  fileName: string | null
  sortOrder: number
}

export interface WorkspaceRsvpItem {
  id: string
  guestName: string
  status: 'hadir' | 'tidak' | 'ragu'
  attendeesCount: number
  message: string | null
  createdAt: string
}

export interface WorkspaceMessageItem {
  id: string
  guestName: string
  message: string
  isApproved: boolean
  createdAt: string
}

export interface WorkspaceHistoryItem {
  id: string
  label: string
  type: string
  createdAt: string
}

export interface SapatamuGiftAccount {
  bankName: string
  accountNumber: string
  accountHolder: string
}

export interface ActivationOffersData {
  invitationId: string
  activationState: ActivationState
  requiredTierCategory: TierCategory
  currentPackage: (SapatamuPackageCatalogItem & {
    features?: Record<string, unknown> | null
  }) | null
  offers: SapatamuPackageCatalogItem[]
}

export interface SapatamuCartData {
  invitationId: string
  orderId: string | null
  status: string
  originalAmount: number
  discountAmount: number
  totalAmount: number
  voucher: { code: string; label: string } | null
  item: {
    packageId: string
    packageCode: string
    packageName: string
    packageType: 'base' | 'upgrade' | 'add_on'
    quantity: number
    price: number
    kind: 'activation' | 'photo_add_on' | 'edit_time_add_on'
  } | null
  availableOffers: SapatamuPackageCatalogItem[]
  availableAddOns: SapatamuPackageCatalogItem[]
}

export interface SapatamuPaymentDetail {
  orderId: string
  invitationId: string | null
  status: string
  amount: number
  originalAmount: number
  discountAmount: number
  voucherCode: string | null
  package: {
    id: string
    code: string
    name: string
    price: number
    packageType: 'base' | 'upgrade' | 'add_on'
  }
  payment: {
    id: string
    method: string
    status: string
    total: number
    expiredAt: string | null
    paymentNumber: string | null
    instructions: string[]
    paidAt: string | null
  } | null
}

export interface SapatamuWorkspace {
  invitation: WorkspaceInvitationSummary
  profiles: SapatamuProfile[]
  events: SapatamuEvent[]
  send: {
    prefaceTemplate: string
    guests: WorkspaceGuest[]
    metadataPreview: {
      title: string
      titleTemplate: string
      date: string
      link: string
      imageUrl: string | null
    }
  }
  album: {
    usedPhotoQuota: number
    allowedPhotoQuota: number
    addOnPackages: SapatamuPackageCatalogItem[]
    items: WorkspaceAlbumItem[]
  }
  rsvp: {
    attendingCount: number
    notAttendingCount: number
    totalGuestsComing: number
    recentResponses: WorkspaceRsvpItem[]
  }
  messages: WorkspaceMessageItem[]
  settings: {
    meta: {
      titleTemplate: string
      description: string
      imageUrl: string | null
    }
    musicSettings: {
      mode: MusicMode
      value: string
    }
    extraLinks: {
      youtube: string
    }
    lastEditedAtDisplay: string | null
    activatedAtDisplay: string | null
    editAccess: {
      status: 'inactive' | 'unknown' | 'active' | 'expired' | 'lifetime'
      expiresAt: string | null
      remainingDays: number | null
      lifetime: boolean
      activatedAt: string | null
      addOnPackages: SapatamuPackageCatalogItem[]
    }
    activeAccess: {
      status: 'inactive' | 'unknown' | 'active' | 'expired' | 'lifetime'
      expiresAt: string | null
      remainingDays: number | null
      lifetime: boolean
      activatedAt: string | null
    }
    giftAccounts: SapatamuGiftAccount[]
    packageOverview: {
      currentPackage: (SapatamuPackageCatalogItem & {
        features?: Record<string, unknown> | null
      }) | null
      activationOffers: SapatamuPackageCatalogItem[]
    }
    helpPath: string
  }
}

export interface SapatamuEditorAnimation {
  style: number
  duration: number
}

export interface SapatamuEditorPadding {
  top: number
  bottom: number
}

export interface SapatamuEditorTextBox {
  disabled: boolean
  borderRadius: number
  backgroundColor: string
  backgroundColor2: string
  gradientAngle: number
}

export interface SapatamuEditorTextElement {
  type: 'text'
  disabled: boolean
  content: string
  color: string
  font: string
  size: number
  align: 'left' | 'center' | 'right'
  lineHeight: number
  padding: SapatamuEditorPadding
  animation: SapatamuEditorAnimation
  box: SapatamuEditorTextBox
}

export interface SapatamuEditorButtonElement {
  type: 'button' | 'url'
  disabled: boolean
  content: string
  color: string
  font: string
  size: number
  align: 'left' | 'center' | 'right'
  padding: SapatamuEditorPadding
  animation: SapatamuEditorAnimation
  borderSize: number
  borderColor: string
  borderRadius: number
  backgroundColor: string
  backgroundColor2: string
  gradientAngle: number
  link: string
  icon: {
    disabled: boolean
    name: string
    src: string
  }
}

export interface SapatamuEditorImageElement {
  type: 'image'
  disabled: boolean
  content: string
  size: number
  borderRadius: string
  borderSize: number
  borderColor: string
  padding: SapatamuEditorPadding
  animation: SapatamuEditorAnimation
  frame: {
    disabled: boolean
    content: string
  }
}

export interface SapatamuEditorTimerElement {
  type: 'timer'
  disabled: boolean
  content: string
  size1: number
  size2: number
  color1: string
  color2: string
  padding: SapatamuEditorPadding
  animation: SapatamuEditorAnimation
  borderSize: number
  borderColor: string
  borderRadius: number
  backgroundColor: string
  backgroundColor2: string
  gradientAngle: number
  english: boolean
}

export interface SapatamuEditorMapElement {
  type: 'map'
  disabled: boolean
  content: string
  url: string
  size: number
  color: string
  backgroundColor: string
  padding: SapatamuEditorPadding
  animation: SapatamuEditorAnimation
}

export interface SapatamuEditorLineElement {
  type: 'line'
  disabled: boolean
  content: string
  size: number
  color: string
  padding: SapatamuEditorPadding
  animation: SapatamuEditorAnimation
}

export interface SapatamuEditorGalleryElement {
  type: 'gallery'
  disabled: boolean
  title: string
  items: string[]
  columns: number
  padding: SapatamuEditorPadding
  animation: SapatamuEditorAnimation
}

export interface SapatamuEditorVideoElement {
  type: 'video'
  disabled: boolean
  title: string
  url: string
  provider: 'youtube' | 'file'
  padding: SapatamuEditorPadding
  animation: SapatamuEditorAnimation
}

export interface SapatamuEditorRsvpElement {
  type: 'rsvp'
  disabled: boolean
  title: string
  description: string
  buttonLabel: string
  padding: SapatamuEditorPadding
  animation: SapatamuEditorAnimation
}

export interface SapatamuEditorGiftElement {
  type: 'gift'
  disabled: boolean
  title: string
  description: string
  padding: SapatamuEditorPadding
  animation: SapatamuEditorAnimation
}

export interface SapatamuEditorStoryElement {
  type: 'story'
  disabled: boolean
  title: string
  items: Array<{
    title: string
    date: string
    description: string
  }>
  padding: SapatamuEditorPadding
  animation: SapatamuEditorAnimation
}

export interface SapatamuEditorSponsorElement {
  type: 'sponsor' | 'credit'
  disabled: boolean
  title: string
  description: string
  padding: SapatamuEditorPadding
  animation: SapatamuEditorAnimation
}

export type SapatamuEditorElement =
  | SapatamuEditorTextElement
  | SapatamuEditorButtonElement
  | SapatamuEditorImageElement
  | SapatamuEditorTimerElement
  | SapatamuEditorMapElement
  | SapatamuEditorLineElement
  | SapatamuEditorGalleryElement
  | SapatamuEditorVideoElement
  | SapatamuEditorRsvpElement
  | SapatamuEditorGiftElement
  | SapatamuEditorStoryElement
  | SapatamuEditorSponsorElement

export interface SapatamuEditorBackgroundDetails {
  type: 'color' | 'image' | 'video'
  color: string
  opacity: number
  gradient: {
    disabled: boolean
    from: string
    to: string
  }
  blend: {
    disabled: boolean
    mode: string
  }
}

export interface SapatamuEditorCornerElement {
  type:
    | 'top_left'
    | 'top_right'
    | 'middle_left'
    | 'middle_right'
    | 'bottom_left'
    | 'bottom_right'
  disabled: boolean
  url: string
  animation: SapatamuEditorAnimation
}

export interface SapatamuEditorCornerElements {
  list: SapatamuEditorCornerElement[]
  style: {
    opacity: number
    gradient: {
      disabled: boolean
      from: string
      to: string
    }
    blend: {
      disabled: boolean
      mode: string
    }
  }
}

export interface SapatamuEditorPage {
  id: string
  uniqueId: number
  title: string
  slug: string
  layoutCode: string
  family: string
  isActive: boolean
  isLocked: boolean
  source: 'base' | 'addon'
  data: Record<string, unknown> & {
    background: string | null
    backgroundDetails: SapatamuEditorBackgroundDetails
    cornerElements: SapatamuEditorCornerElements
  }
}

export interface SapatamuEditorFontCatalogItem {
  id: string
  name: string
  fontUrl: string
  category: 'display' | 'serif' | 'sans' | 'script'
}

export interface SapatamuEditorLayoutCatalogItem {
  layoutCode: string
  family: string
  title: string
  previewImageUrl: string
  defaultPageData: Record<string, unknown>
  requiredTier: TierCategory
  requiredFeatureCode: string | null
  maxInstances: number
  sortOrder: number
  supportsPreviewSelection: boolean
  mediaRequirements: 'none' | 'image' | 'video' | 'mixed'
}

export interface SapatamuEditorFeatureGate {
  code: string
  enabled: boolean
  label: string
  reason: string | null
}

export interface SapatamuEditorPackageFeatures {
  tierCategory: TierCategory
  canUseImageBackground: boolean
  canUseVideoBackground: boolean
  canUseGallery: boolean
  canUseVideoSection: boolean
  canUseGift: boolean
  canUseContact: boolean
  canUseLoveStory: boolean
  canUseSponsor: boolean
  canUseExtraLink: boolean
  canUseLiveStreaming: boolean
}

export interface SapatamuEditorState {
  pages: SapatamuEditorPage[]
  globalBackground: string | null
  globalBackgroundDetails: SapatamuEditorBackgroundDetails
  cornerElements: SapatamuEditorCornerElements
  navMenu: {
    enabled: boolean
    activeColor: string
    inactiveColor: string
  }
  fullScreen: {
    enabled: boolean
  }
  colorPalette: {
    themeId: string
    canvas: string
    surface: string
    accent: string
    accentSoft: string
    text: string
    muted: string
    overlay: string
  }
  packageFeatures: SapatamuEditorPackageFeatures
  layoutCatalogSnapshot: Array<{
    layoutCode: string
    family: string
    title: string
    previewImageUrl: string
    requiredTier: TierCategory
    requiredFeatureCode: string | null
  }>
}

export interface SapatamuEditorDocumentV3 {
  schemaVersion: 3
  selectedTheme: string
  profiles: SapatamuProfile[]
  events: SapatamuEvent[]
  sendSettings: {
    prefaceTemplate: string
  }
  albumSettings: {
    basePhotoQuota: number
  }
  meta: {
    titleTemplate: string
    description: string
    imageUrl: string | null
  }
  musicSettings: {
    mode: MusicMode
    value: string
  }
  extraLinks: {
    youtube: string
  }
  settings: {
    commerce: {
      requiredTierCategory: TierCategory
      selectedPackageCode: string | null
      activationState: 'inactive' | 'active'
    }
    giftAccounts: SapatamuGiftAccount[]
    lastEditedAtDisplay: string | null
    activatedAtDisplay: string | null
  }
  historyDisplayHints: Record<string, unknown>
  weddingData: Record<string, unknown>
  editor: SapatamuEditorState
}

export type SapatamuEditorPatchOperation =
  | {
      type: 'set_global_field'
      path: string
      value: unknown
    }
  | {
      type: 'set_page_field'
      uniqueId: number
      path: string
      value: unknown
    }
  | {
      type: 'replace_page'
      uniqueId: number
      page: SapatamuEditorPage
    }
  | {
      type: 'reorder_pages'
      orderedUniqueIds: number[]
    }
  | {
      type: 'add_page'
      page: SapatamuEditorPage
      afterUniqueId?: number
    }
  | {
      type: 'remove_page'
      uniqueId: number
    }

export interface SapatamuEditorPatchRequest {
  baseVersion: number
  operations: SapatamuEditorPatchOperation[]
}

export interface SapatamuEditorMediaItem {
  id: string
  url: string
  fileName: string | null
  sortOrder: number
  mediaType: 'image' | 'video'
}

export interface SapatamuEditorHydrationResponse {
  invitation: {
    id: string
    title: string
    slug: string
    publicUrl: string
    previewUrl: string
    status: SapatamuProductStatus
    theme: {
      id: string
      code: string
      name: string
    } | null
  }
  document: SapatamuEditorDocumentV3
  currentVersion: number
  catalog: {
    layouts: SapatamuEditorLayoutCatalogItem[]
    fonts: SapatamuEditorFontCatalogItem[]
    featureGates: SapatamuEditorFeatureGate[]
    media: SapatamuEditorMediaItem[]
  }
  session: {
    autoSaveDelayMs: number
    availableVariables: Array<{
      token: string
      label: string
      example: string
    }>
  }
}
