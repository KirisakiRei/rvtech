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
