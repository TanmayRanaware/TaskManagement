import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Header from './Header'
import Sidebar from './Sidebar'
import { useState } from 'react'

export default function Layout() {
  const { user } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}