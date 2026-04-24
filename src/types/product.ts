export interface Product {
  id: string
  tenantId: string
  productName: string
  price: number
  description: string
  imageUrl: string
  isAvailable: boolean
  category?: string
  createdAt: string
}
