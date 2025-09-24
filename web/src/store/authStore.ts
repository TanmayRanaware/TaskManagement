import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@/services/auth'
import toast from 'react-hot-toast'

export interface User {
  _id: string
  email: string
  username: string
  firstName: string
  lastName: string
  role: string
  isEmailVerified: boolean
  preferences: {
    theme: 'light' | 'dark' | 'system'
    notifications: {
      email: boolean
      push: boolean
      taskUpdates: boolean
      projectUpdates: boolean
    }
    language: string
    timezone: string
  }
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (emailOrUsername: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshAccessToken: () => Promise<void>
  updateUser: (user: Partial<User>) => void
  clearError: () => void
  initializeAuth: () => void
}

interface RegisterData {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (emailOrUsername: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authService.login(emailOrUsername, password)
          
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          
          toast.success('Login successful!')
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || 'Login failed'
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })
          toast.error(errorMessage)
          throw error
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authService.register(data)
          
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          
          toast.success('Registration successful!')
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || 'Registration failed'
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })
          toast.error(errorMessage)
          throw error
        }
      },

      logout: async () => {
        try {
          const { accessToken } = get()
          if (accessToken) {
            await authService.logout()
          }
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
          toast.success('Logged out successfully')
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        try {
          const response = await authService.refreshToken(refreshToken)
          
          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          })
        } catch (error) {
          // If refresh fails, logout user
          get().logout()
          throw error
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...userData },
          })
        }
      },

      clearError: () => {
        set({ error: null })
      },

      initializeAuth: () => {
        const { accessToken, refreshToken } = get()
        
        if (accessToken && refreshToken) {
          set({ isAuthenticated: true, isLoading: false })
        } else {
          set({ isAuthenticated: false, isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
