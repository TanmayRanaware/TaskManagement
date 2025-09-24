import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useEffect } from 'react'
import { Toaster } from 'sonner'

// Pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import ProjectsPage from '@/pages/projects/ProjectsPage'
import ProjectDetailPage from '@/pages/projects/ProjectDetailPage'
import TasksPage from '@/pages/tasks/TasksPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Components
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function App() {
  const { initializeAuth, isInitialized } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="tasks" element={<TasksPage />} />
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      
      <Toaster />
    </div>
  )
}

export default App