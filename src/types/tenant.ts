export type ProductCategory = 'sapatamu' | 'etalasepro' | 'citrakorpora' | 'edugerbang'
export type TenantTier = 'basic' | 'pro'
export type TenantStatus = 'active' | 'expired' | 'suspended'

export interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  heroStyle: string
  templateId: string
}

export interface Tenant {
  id: string
  userId: string
  domainUrl: string
  productCategory: ProductCategory
  tier: TenantTier
  themeSettings: ThemeSettings
  status: TenantStatus
  createdAt: string
  expiresAt: string
  ownerName: string
  ownerEmail: string
}
