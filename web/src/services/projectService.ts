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

export interface Project {
  _id: string
  name: string
  description?: string
  color: string
  status: 'active' | 'archived' | 'completed'
  ownerId: string
  members: ProjectMember[]
  settings: {
    isPublic: boolean
    allowMemberInvites: boolean
    defaultTaskStatus: string
    taskLabels: string[]
  }
  statistics: {
    totalTasks: number
    completedTasks: number
    overdueTasks: number
    membersCount: number
  }
  createdAt: string
  updatedAt: string
}

export interface ProjectMember {
  userId: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  joinedAt: string
  permissions: {
    canEdit: boolean
    canDelete: boolean
    canInvite: boolean
    canManageTasks: boolean
  }
}

export interface CreateProjectData {
  name: string
  description?: string
  color?: string
  settings?: {
    isPublic?: boolean
    allowMemberInvites?: boolean
    defaultTaskStatus?: string
    taskLabels?: string[]
  }
}

export interface UpdateProjectData {
  name?: string
  description?: string
  color?: string
  status?: 'active' | 'archived' | 'completed'
  settings?: {
    isPublic?: boolean
    allowMemberInvites?: boolean
    defaultTaskStatus?: string
    taskLabels?: string[]
  }
}

export interface AddMemberData {
  userId: string
  role: 'admin' | 'member' | 'viewer'
}

export interface ProjectFilters {
  status?: 'active' | 'archived' | 'completed'
  search?: string
}

export const projectService = {
  async getProjects(
    page: number = 1,
    limit: number = 10,
    filters: ProjectFilters = {}
  ): Promise<{
    projects: Project[]
    total: number
    page: number
    pages: number
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (filters.status) params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)

    const response = await api.get(`/projects?${params.toString()}`)
    return response.data.data
  },

  async getProjectById(projectId: string): Promise<Project> {
    const response = await api.get(`/projects/${projectId}`)
    return response.data.data.project
  },

  async createProject(data: CreateProjectData): Promise<Project> {
    const response = await api.post('/projects', data)
    return response.data.data.project
  },

  async updateProject(projectId: string, data: UpdateProjectData): Promise<Project> {
    const response = await api.put(`/projects/${projectId}`, data)
    return response.data.data.project
  },

  async deleteProject(projectId: string): Promise<void> {
    await api.delete(`/projects/${projectId}`)
  },

  async addMember(projectId: string, data: AddMemberData): Promise<void> {
    await api.post(`/projects/${projectId}/members`, data)
  },

  async removeMember(projectId: string, memberId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/members/${memberId}`)
  },

  async updateMemberRole(
    projectId: string,
    memberId: string,
    role: string
  ): Promise<void> {
    await api.patch(`/projects/${projectId}/members/${memberId}/role`, { role })
  },
}
