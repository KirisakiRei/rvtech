import { create } from 'zustand'
import type { User } from '@/types/user'
import {
  authLogin,
  authLogout,
  authMe,
  authRegister,
  clearAuthTokens,
  consumeSessionExpired,
  getAccessToken,
  markSessionExpired,
  setAuthTokens,
} from '@/lib/api'
import { AppError } from '@/lib/error'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  initialized: boolean
  initializeAuth: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

function mapRole(role: string | undefined): User['role'] {
  return role === 'admin' ? 'ADMIN' : 'CLIENT'
}

function buildUser(meData: { accountId: string; role: string; data: any }): User {
  const profile = meData.data
  return {
    id: typeof profile?.id === 'string' ? profile.id : meData.accountId,
    email: typeof profile?.email === 'string' ? profile.email : '',
    name: typeof profile?.name === 'string' ? profile.name : 'User',
    role: mapRole(meData.role),
    createdAt: typeof profile?.created_at === 'string' ? profile.created_at : new Date().toISOString(),
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  initialized: false,

  initializeAuth: async () => {
    const token = getAccessToken()
    if (!token) {
      set({ initialized: true, isAuthenticated: false, user: null })
      return
    }

    try {
      const me = await authMe()
      if (!me.data) throw new AppError('Sesi akun tidak valid.')

      set({
        user: buildUser(me.data),
        isAuthenticated: true,
        initialized: true,
      })
    } catch {
      if (token && !consumeSessionExpired()) {
        markSessionExpired()
      }
      clearAuthTokens()
      set({ user: null, isAuthenticated: false, initialized: true })
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true })

    try {
      const loginResult = await authLogin({ identifier: email, password })
      if (!loginResult.data) throw new AppError('Token login tidak diterima.')

      setAuthTokens(loginResult.data)

      const me = await authMe()
      if (!me.data) throw new AppError('Profil pengguna tidak ditemukan.')

      set({
        user: buildUser(me.data),
        isAuthenticated: true,
        isLoading: false,
        initialized: true,
      })
    } catch (error) {
      clearAuthTokens()
      set({ isLoading: false, isAuthenticated: false, user: null })
      throw error
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true })

    try {
      await authRegister({ name, email, password })

      const loginResult = await authLogin({ identifier: email, password })
      if (!loginResult.data) throw new AppError('Token login tidak diterima.')

      setAuthTokens(loginResult.data)

      const me = await authMe()
      if (!me.data) throw new AppError('Profil pengguna tidak ditemukan.')

      set({
        user: buildUser(me.data),
        isAuthenticated: true,
        isLoading: false,
        initialized: true,
      })
    } catch (error) {
      clearAuthTokens()
      set({ isLoading: false, isAuthenticated: false, user: null })
      throw error
    }
  },

  logout: async () => {
    try {
      await authLogout()
    } catch {
      // ignore logout transport errors and clear local state anyway
    }

    clearAuthTokens()
    set({ user: null, isAuthenticated: false })
  },
}))
