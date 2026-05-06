import type { DataListResult } from '@/lib/api'
import type {
  SapatamuEditorDocumentV3,
  SapatamuEditorFontCatalogItem,
  SapatamuEditorLayoutCatalogItem,
} from './sapatamu'

export type AdminList<T> = DataListResult<T>

export type AdminOverview = {
  kpis: {
    users: number
    activeUsers: number
    invitations: number
    publishedInvitations: number
    orders: number
    payments: number
    pendingPayments: number
    failedPayments: number
    revenue: number
    conversionRate: number
  }
  products: AdminProductSummary[]
  topTemplates: Array<{
    templateId: string
    name: string
    code: string
    productCode: string
    invitations: number
  }>
}

export type AdminProductSummary = {
  code: string
  name: string
  description: string
  status: 'active' | 'coming_soon' | 'inactive'
  templates: number
  packages: number
  invitations: number
  orders: number
  revenue: number
}

export type AdminUserListItem = {
  id: string
  accountId: string
  name: string
  email: string
  role: 'admin' | 'user'
  status: 'active' | 'suspended'
  username: string
  totalInvitations: number
  totalOrders: number
  totalLicenses: number
  totalRevenue: number
  createdAt: string
  updatedAt: string
}

export type AdminUserDetail = {
  profile: AdminUserListItem & {
    phoneNumber: string | null
    address: string | null
  }
  invitations: Array<{
    id: string
    title: string
    status: string
    slug: string | null
    editorUrl: string
    manageUrl: string
    guests: number
    rsvps: number
    views: number
    updatedAt: string
  }>
  orders: AdminFinanceOrder[]
  licenses: unknown[]
}

export type AdminFinanceOrder = {
  id: string
  status: string
  total_amount: string | number
  currency: string
  checkout_token: string
  created_at: string
  user?: { id: string; name: string; email: string }
  payments?: AdminFinancePayment[]
  order_items?: Array<{
    id: string
    qty: number
    subtotal: string | number
    package?: AdminPackage
    template?: AdminTemplate
    metadata?: Record<string, unknown>
  }>
}

export type AdminFinancePayment = {
  id: string
  order_id: string
  method: string
  status: string
  provider_ref: string | null
  amount: string | number
  paid_at: string | null
  metadata?: Record<string, unknown>
  created_at: string
  order?: AdminFinanceOrder
}

export type AdminVoucher = {
  id: string
  product_code: string | null
  package_id: string | null
  code: string
  label: string
  description: string | null
  discount_type: 'percent' | 'fixed'
  discount_value: string | number
  min_order_amount: string | number | null
  max_discount_amount: string | number | null
  quota_total: number | null
  quota_per_user: number | null
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  created_at: string
  _count?: { redemptions: number }
}

export type AdminPackage = {
  id: string
  product_code: string
  code: string
  name: string
  description: string | null
  price: string | number
  currency: string
  package_type: 'base' | 'upgrade' | 'add_on'
  features_json?: Record<string, unknown>
  is_active: boolean
  sort_order: number
}

export type AdminTemplate = {
  id: string
  product_code: string
  code: string
  name: string
  category: string | null
  description: string | null
  preview_image_url: string | null
  metadata?: Record<string, unknown>
  is_active: boolean
  created_at: string
  template_assets?: AdminTemplateAsset[]
  _count?: {
    invitations: number
    package_template_access: number
    editor_layout_templates: number
  }
}

export type AdminTemplateAsset = {
  id: string
  template_id: string | null
  product_code: string
  asset_type: string
  asset_key: string
  url: string
  file_name: string | null
  metadata?: Record<string, unknown>
  sort_order: number
  is_active: boolean
}

export type AdminEditorLayoutTemplate = {
  id: string
  product_code: string
  template_id: string | null
  layout_code: string
  family: string
  title: string
  preview_image_url: string | null
  default_data_json?: Record<string, unknown>
  required_feature_code: string | null
  max_instances: number | null
  sort_order: number
  supports_preview_selection: boolean
  is_active: boolean
}

export type AdminSapatamuTemplateEditorPayload = {
  template: AdminTemplate
  assets: AdminTemplateAsset[]
  layouts: SapatamuEditorLayoutCatalogItem[]
  previewDocument: SapatamuEditorDocumentV3
  catalog: {
    layouts: SapatamuEditorLayoutCatalogItem[]
    fonts: SapatamuEditorFontCatalogItem[]
    featureGates: Array<{
      code: string
      enabled: boolean
      label: string
      reason: string | null
    }>
    media: Array<{
      id: string
      url: string
      fileName: string | null
      sortOrder: number
      mediaType: string
    }>
  }
}

export type AdminAuditLog = {
  id: string
  action: string
  entity: string
  entity_id: string | null
  before_json?: Record<string, unknown>
  after_json?: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  created_at: string
  admin_user?: { name: string; email: string }
}
