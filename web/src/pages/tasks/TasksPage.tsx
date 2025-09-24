export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
          <p className="text-gray-600">View and manage all your tasks across projects.</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
          Create Task
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Setup project infrastructure</div>
                    <div className="text-sm text-gray-500">Set up the basic project structure</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Team Alpha</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Done
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">High</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Jan 15, 2024</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Design user interface</div>
                    <div className="text-sm text-gray-500">Create wireframes and mockups</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Team Alpha</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      In Progress
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">High</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Jan 20, 2024</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Implement authentication</div>
                    <div className="text-sm text-gray-500">Set up user authentication</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Team Alpha</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Review
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Medium</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Jan 18, 2024</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}