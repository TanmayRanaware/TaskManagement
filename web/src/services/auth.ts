import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-storage')
    if (token) {
      try {
        const authData = JSON.parse(token)
        if (authData.state?.accessToken) {
          config.headers.Authorization = `Bearer ${authData.state.accessToken}`
        }
      } catch (error) {
        console.error('Error parsing auth token:', error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const token = localStorage.getItem('auth-storage')
        if (token) {
          const authData = JSON.parse(token)
          const refreshToken = authData.state?.refreshToken

          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
              refreshToken,
            })

            const { accessToken, refreshToken: newRefreshToken } = response.data.data

            // Update stored tokens
            const updatedAuthData = {
              ...authData,
              state: {
                ...authData.state,
                accessToken,
                refreshToken: newRefreshToken,
              },
            }
            localStorage.setItem('auth-storage', JSON.stringify(updatedAuthData))

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return api(originalRequest)
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export interface LoginRequest {
  emailOrUsername: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  user: {
    _id: string
    email: string
    username: string
    firstName: string
    lastName: string
    role: string
    isEmailVerified: boolean
    preferences: any
  }
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data)
    return response.data.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data)
    return response.data.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await api.post('/auth/refresh', { refreshToken })
    return response.data.data
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    })
  },

  async verifyEmail(): Promise<void> {
    await api.post('/auth/verify-email')
  },

  async getProfile(): Promise<any> {
    const response = await api.get('/auth/me')
    return response.data.data
  },
}
