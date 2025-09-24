import { useParams } from 'react-router-dom'

export default function ProjectDetailPage() {
  const { id } = useParams()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Project Detail</h1>
        <p className="text-gray-600">Project ID: {id}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Project Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Name</label>
            <p className="mt-1 text-sm text-gray-900">Team Alpha</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <p className="mt-1 text-sm text-gray-900">Active</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Members</label>
            <p className="mt-1 text-sm text-gray-900">3</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tasks</label>
            <p className="mt-1 text-sm text-gray-900">12</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Kanban Board</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Backlog</h3>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded border">
                <p className="text-sm font-medium">Task 1</p>
                <p className="text-xs text-gray-500">High Priority</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">In Progress</h3>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded border">
                <p className="text-sm font-medium">Task 2</p>
                <p className="text-xs text-gray-500">Medium Priority</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Review</h3>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded border">
                <p className="text-sm font-medium">Task 3</p>
                <p className="text-xs text-gray-500">Low Priority</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Done</h3>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded border">
                <p className="text-sm font-medium">Task 4</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}