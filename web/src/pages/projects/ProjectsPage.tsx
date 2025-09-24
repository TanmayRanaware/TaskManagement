export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your projects and collaborate with your team.</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
          Create Project
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Team Alpha</h3>
          <p className="text-gray-600 mt-2">Main project for Team Alpha development</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">12 tasks</span>
            <span className="text-sm text-gray-500">3 members</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Website Redesign</h3>
          <p className="text-gray-600 mt-2">Complete redesign of company website</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">8 tasks</span>
            <span className="text-sm text-gray-500">2 members</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Mobile App</h3>
          <p className="text-gray-600 mt-2">New mobile application development</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">15 tasks</span>
            <span className="text-sm text-gray-500">4 members</span>
          </div>
        </div>
      </div>
    </div>
  )
}