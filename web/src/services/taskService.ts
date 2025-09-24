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

export interface Task {
  _id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  projectId: string
  assigneeId?: string
  createdById: string
  dueDate?: string
  completedAt?: string
  labels: string[]
  attachments: any[]
  subtasks: Subtask[]
  estimatedHours?: number
  actualHours?: number
  position: number
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface Subtask {
  title: string
  completed: boolean
  completedAt?: string
}

export interface CreateTaskData {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  projectId: string
  assigneeId?: string
  dueDate?: string
  labels?: string[]
  estimatedHours?: number
  subtasks?: {
    title: string
    completed?: boolean
  }[]
}

export interface UpdateTaskData {
  title?: string
  description?: string
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assigneeId?: string
  dueDate?: string
  labels?: string[]
  estimatedHours?: number
  actualHours?: number
  position?: number
  subtasks?: {
    title: string
    completed?: boolean
  }[]
}

export interface TaskFilters {
  projectId?: string
  status?: string
  priority?: string
  assigneeId?: string
  createdById?: string
  labels?: string[]
  dueDateFrom?: string
  dueDateTo?: string
  search?: string
}

export const taskService = {
  async getTasks(
    page: number = 1,
    limit: number = 20,
    filters: TaskFilters = {}
  ): Promise<{
    tasks: Task[]
    total: number
    page: number
    pages: number
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params.append(key, value.join(','))
        } else {
          params.append(key, value.toString())
        }
      }
    })

    const response = await api.get(`/tasks?${params.toString()}`)
    return response.data.data
  },

  async getTaskById(taskId: string): Promise<Task> {
    const response = await api.get(`/tasks/${taskId}`)
    return response.data.data.task
  },

  async getProjectTasks(projectId: string, status?: string): Promise<Task[]> {
    const params = new URLSearchParams()
    if (status) params.append('status', status)

    const response = await api.get(`/tasks/project/${projectId}?${params.toString()}`)
    return response.data.data.tasks
  },

  async createTask(data: CreateTaskData): Promise<Task> {
    const response = await api.post('/tasks', data)
    return response.data.data.task
  },

  async updateTask(taskId: string, data: UpdateTaskData): Promise<Task> {
    const response = await api.put(`/tasks/${taskId}`, data)
    return response.data.data.task
  },

  async deleteTask(taskId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}`)
  },

  async updateTaskPosition(taskId: string, position: number): Promise<void> {
    await api.patch(`/tasks/${taskId}/position`, { position })
  },
}
