export interface WeddingDetail {
  id: string
  tenantId: string
  brideName: string
  groomName: string
  bridePhoto?: string
  groomPhoto?: string
  brideParents?: string
  groomParents?: string
  akadTime: string
  akadLocation: string
  akadMapUrl?: string
  resepsiTime: string
  resepsiLocation: string
  resepsiMapUrl?: string
  bgmUrl?: string
  bankAccountInfo?: BankAccount[]
  loveStory?: string
}

export interface BankAccount {
  bankName: string
  accountName: string
  accountNumber: string
}

export interface WeddingGallery {
  id: string
  tenantId: string
  imageUrl: string
  sortOrder: number
}

export interface WeddingRsvp {
  id: string
  tenantId: string
  guestName: string
  status: 'hadir' | 'tidak' | 'ragu'
  message: string
  createdAt: string
  jumlahTamu?: number
}

export type WeddingThemeId =
  | 'malay-ethnic-red-ruby'
  | 'batak-ethnic-maroon-mistyrose'
  | 'calla-lily-plum-red-lead'
  | 'kabagyan-linnea-swan-white'
  | 'honeysuckle-seashell'
  | 'hollyhock-nauli-sienna-ivory'
  | 'cheerfulness-floralwhite'
  | 'javanese-magnolia-tan-mahogany'
  | 'polyanthus-linnea-light-coral'
  | 'javanese-linnea-greenish-white'
  | 'aishwarya-peonny'

export interface WeddingThemePreset {
  id: WeddingThemeId
  name: string
  group?: string
  description: string
  previewImage: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontHeading: string
  fontBody: string
  bgPattern?: string
}
