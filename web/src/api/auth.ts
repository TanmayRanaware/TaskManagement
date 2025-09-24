import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const tokens = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    if (tokens?.state?.tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.state.tokens.accessToken}`
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
        const tokens = JSON.parse(localStorage.getItem('auth-storage') || '{}')
        if (tokens?.state?.tokens?.refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/api/v1/auth/refresh`,
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
