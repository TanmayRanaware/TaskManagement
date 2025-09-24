import { useAuthStore } from '@/store/authStore'

const ProfilePage = () => {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {user?.firstName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {user?.lastName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {user?.email}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {user?.username}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
