import { create } from 'zustand'
import { projectService, Project, CreateProjectData, UpdateProjectData, AddMemberData } from '@/services/projectService'
import toast from 'react-hot-toast'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface ProjectActions {
  fetchProjects: (page?: number, limit?: number, filters?: any) => Promise<void>
  fetchProjectById: (projectId: string) => Promise<void>
  createProject: (data: CreateProjectData) => Promise<Project>
  updateProject: (projectId: string, data: UpdateProjectData) => Promise<Project>
  deleteProject: (projectId: string) => Promise<void>
  addMember: (projectId: string, data: AddMemberData) => Promise<void>
  removeMember: (projectId: string, memberId: string) => Promise<void>
  updateMemberRole: (projectId: string, memberId: string, role: string) => Promise<void>
  setCurrentProject: (project: Project | null) => void
  clearError: () => void
}

type ProjectStore = ProjectState & ProjectActions

export const useProjectStore = create<ProjectStore>((set, get) => ({
  // State
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },

  // Actions
  fetchProjects: async (page = 1, limit = 10, filters = {}) => {
    set({ isLoading: true, error: null })
    
    try {
      const result = await projectService.getProjects(page, limit, filters)
      
      set({
        projects: result.projects,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages,
        },
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to fetch projects'
      set({
        projects: [],
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  fetchProjectById: async (projectId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const project = await projectService.getProjectById(projectId)
      
      set({
        currentProject: project,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to fetch project'
      set({
        currentProject: null,
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  createProject: async (data: CreateProjectData) => {
    set({ isLoading: true, error: null })
    
    try {
      const project = await projectService.createProject(data)
      
      set((state) => ({
        projects: [project, ...state.projects],
        isLoading: false,
        error: null,
      }))
      
      toast.success('Project created successfully!')
      return project
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to create project'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  updateProject: async (projectId: string, data: UpdateProjectData) => {
    set({ isLoading: true, error: null })
    
    try {
      const project = await projectService.updateProject(projectId, data)
      
      set((state) => ({
        projects: state.projects.map(p => p._id === projectId ? project : p),
        currentProject: state.currentProject?._id === projectId ? project : state.currentProject,
        isLoading: false,
        error: null,
      }))
      
      toast.success('Project updated successfully!')
      return project
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to update project'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  deleteProject: async (projectId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      await projectService.deleteProject(projectId)
      
      set((state) => ({
        projects: state.projects.filter(p => p._id !== projectId),
        currentProject: state.currentProject?._id === projectId ? null : state.currentProject,
        isLoading: false,
        error: null,
      }))
      
      toast.success('Project deleted successfully!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to delete project'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  addMember: async (projectId: string, data: AddMemberData) => {
    set({ isLoading: true, error: null })
    
    try {
      await projectService.addMember(projectId, data)
      
      // Refresh the current project to get updated member list
      if (get().currentProject?._id === projectId) {
        await get().fetchProjectById(projectId)
      }
      
      set({ isLoading: false, error: null })
      toast.success('Member added successfully!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to add member'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  removeMember: async (projectId: string, memberId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      await projectService.removeMember(projectId, memberId)
      
      // Refresh the current project to get updated member list
      if (get().currentProject?._id === projectId) {
        await get().fetchProjectById(projectId)
      }
      
      set({ isLoading: false, error: null })
      toast.success('Member removed successfully!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to remove member'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  updateMemberRole: async (projectId: string, memberId: string, role: string) => {
    set({ isLoading: true, error: null })
    
    try {
      await projectService.updateMemberRole(projectId, memberId, role)
      
      // Refresh the current project to get updated member list
      if (get().currentProject?._id === projectId) {
        await get().fetchProjectById(projectId)
      }
      
      set({ isLoading: false, error: null })
      toast.success('Member role updated successfully!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to update member role'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project })
  },

  clearError: () => {
    set({ error: null })
  },
}))
