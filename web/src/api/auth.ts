import axios from 'axios'

// Use Vite proxy instead of direct API calls to avoid CORS issues
const API_BASE_URL = '' // Use relative URLs to leverage Vite proxy

const api = axios.create({
  baseURL: '/api/v1', // This will be proxied by Vite to http://localhost:4000/api/v1
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Making API request:', config.method?.toUpperCase(), config.url)
    const tokens = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    if (tokens?.state?.tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.state.tokens.accessToken}`
    }
    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log('✅ API response received:', response.status, response.config.url)
    return response
  },
  async (error) => {
    console.error('❌ API error:', error.message, error.config?.url)
    console.error('❌ Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
    
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const tokens = JSON.parse(localStorage.getItem('auth-storage') || '{}')
        if (tokens?.state?.tokens?.refreshToken) {
          const response = await axios.post(
            '/api/v1/auth/refresh', // Use proxy
            { refreshToken: tokens.state.tokens.refreshToken }
          )

          const { tokens: newTokens } = response.data.data
          const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}')
          authStorage.state.tokens = newTokens
          localStorage.setItem('auth-storage', JSON.stringify(authStorage))

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (email: string, name: string, password: string) =>
    api.post('/auth/signup', { email, name, password }),
  
  logout: () =>
    api.post('/auth/logout'),
  
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  
  getProfile: () =>
    api.get('/users/me'),
}

export default api
