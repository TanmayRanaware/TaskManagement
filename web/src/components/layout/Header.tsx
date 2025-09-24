import { useAuthStore } from '@/stores/authStore'
import { Menu, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="text-gray-500 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Task Manager
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <User className="h-6 w-6" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-sm"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}