import { create } from 'zustand'
import { taskService, Task, CreateTaskData, UpdateTaskData } from '@/services/taskService'
import toast from 'react-hot-toast'

interface TaskState {
  tasks: Task[]
  currentTask: Task | null
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface TaskActions {
  fetchTasks: (page?: number, limit?: number, filters?: any) => Promise<void>
  fetchTaskById: (taskId: string) => Promise<void>
  fetchProjectTasks: (projectId: string, status?: string) => Promise<void>
  createTask: (data: CreateTaskData) => Promise<Task>
  updateTask: (taskId: string, data: UpdateTaskData) => Promise<Task>
  deleteTask: (taskId: string) => Promise<void>
  updateTaskPosition: (taskId: string, position: number) => Promise<void>
  setCurrentTask: (task: Task | null) => void
  clearError: () => void
}

type TaskStore = TaskState & TaskActions

export const useTaskStore = create<TaskStore>((set, get) => ({
  // State
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },

  // Actions
  fetchTasks: async (page = 1, limit = 20, filters = {}) => {
    set({ isLoading: true, error: null })
    
    try {
      const result = await taskService.getTasks(page, limit, filters)
      
      set({
        tasks: result.tasks,
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
      const errorMessage = error.response?.data?.error?.message || 'Failed to fetch tasks'
      set({
        tasks: [],
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  fetchTaskById: async (taskId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const task = await taskService.getTaskById(taskId)
      
      set({
        currentTask: task,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to fetch task'
      set({
        currentTask: null,
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  fetchProjectTasks: async (projectId: string, status?: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const tasks = await taskService.getProjectTasks(projectId, status)
      
      set({
        tasks,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to fetch project tasks'
      set({
        tasks: [],
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  createTask: async (data: CreateTaskData) => {
    set({ isLoading: true, error: null })
    
    try {
      const task = await taskService.createTask(data)
      
      set((state) => ({
        tasks: [task, ...state.tasks],
        isLoading: false,
        error: null,
      }))
      
      toast.success('Task created successfully!')
      return task
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to create task'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  updateTask: async (taskId: string, data: UpdateTaskData) => {
    set({ isLoading: true, error: null })
    
    try {
      const task = await taskService.updateTask(taskId, data)
      
      set((state) => ({
        tasks: state.tasks.map(t => t._id === taskId ? task : t),
        currentTask: state.currentTask?._id === taskId ? task : state.currentTask,
        isLoading: false,
        error: null,
      }))
      
      toast.success('Task updated successfully!')
      return task
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to update task'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  deleteTask: async (taskId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      await taskService.deleteTask(taskId)
      
      set((state) => ({
        tasks: state.tasks.filter(t => t._id !== taskId),
        currentTask: state.currentTask?._id === taskId ? null : state.currentTask,
        isLoading: false,
        error: null,
      }))
      
      toast.success('Task deleted successfully!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to delete task'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  updateTaskPosition: async (taskId: string, position: number) => {
    try {
      await taskService.updateTaskPosition(taskId, position)
      
      set((state) => ({
        tasks: state.tasks.map(t => 
          t._id === taskId ? { ...t, position } : t
        ),
      }))
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to update task position'
      toast.error(errorMessage)
      throw error
    }
  },

  setCurrentTask: (task: Task | null) => {
    set({ currentTask: task })
  },

  clearError: () => {
    set({ error: null })
  },
}))
