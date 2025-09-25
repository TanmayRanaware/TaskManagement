import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api/auth'

export interface User {
  _id: string
  email: string
  name: string
  avatarUrl?: string
  roles: string[]
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isInitialized: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
  initializeAuth: () => void
  setUser: (user: User | null) => void
  setTokens: (tokens: AuthTokens | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      tokens: null,
      isAuthenticated: false,
      isInitialized: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authApi.login(email, password)
          const { user, tokens } = response.data.data
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || error.message || 'Login failed'
          set({
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      register: async (email: string, name: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authApi.register(email, name, password)
          const { user, tokens } = response.data.data
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || error.message || 'Registration failed'
          set({
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
        })
      },

      initializeAuth: () => {
        const { tokens } = get()
        
        if (tokens?.accessToken) {
          // TODO: Verify token validity
          set({ isAuthenticated: true, isInitialized: true })
        } else {
          set({ isAuthenticated: false, isInitialized: true })
        }
      },

      setUser: (user: User | null) => {
        set({ user })
      },

      setTokens: (tokens: AuthTokens | null) => {
        set({ tokens })
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
