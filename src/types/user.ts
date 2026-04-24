export type UserRole = 'ADMIN' | 'CLIENT'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatarUrl?: string
  createdAt: string
}
