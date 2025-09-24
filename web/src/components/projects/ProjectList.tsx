import { useEffect, useState } from 'react'
import { useProjectStore } from '@/store/projectStore'
import ProjectCard from './ProjectCard'
import CreateProjectModal from './CreateProjectModal'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const ProjectList = () => {
  const {
    projects,
    isLoading,
    error,
    pagination,
    fetchProjects,
    clearError,
  } = useProjectStore()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived' | 'completed'>('all')

  useEffect(() => {
    fetchProjects(1, 10, {
      search: searchTerm || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
    })
  }, [searchTerm, statusFilter, fetchProjects])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilter = (status: 'all' | 'active' | 'archived' | 'completed') => {
    setStatusFilter(status)
  }

  const handlePageChange = (page: number) => {
    fetchProjects(page, 10, {
      search: searchTerm || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
    })
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={() => clearError()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your projects and collaborate with your team.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={handleSearch}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'archived', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'No projects found matching your criteria.'
              : 'No projects yet. Create your first project to get started!'}
          </div>
          {!searchTerm && statusFilter === 'all' && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.pages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  )
}

export default ProjectList
