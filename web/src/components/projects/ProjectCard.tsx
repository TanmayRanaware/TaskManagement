import { Link } from 'react-router-dom'
import { Project } from '@/services/projectService'
import { useProjectStore } from '@/store/projectStore'
import Button from '@/components/common/Button'
import { 
  EllipsisVerticalIcon, 
  UsersIcon, 
  CheckSquareIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

interface ProjectCardProps {
  project: Project
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const { deleteProject } = useProjectStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject(project._id)
      } catch (error) {
        // Error is handled by the store
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getProgressPercentage = () => {
    if (project.statistics.totalTasks === 0) return 0
    return Math.round((project.statistics.completedTasks / project.statistics.totalTasks) * 100)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {project.name}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-600">
                <div className="py-1">
                  <Link
                    to={`/projects/${project._id}`}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleDelete()
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <CheckSquareIcon className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {project.statistics.totalTasks}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tasks</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {project.statistics.membersCount}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-400 mr-1" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {project.statistics.overdueTasks}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Overdue</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{getProgressPercentage()}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            asChild
            className="flex-1"
            size="sm"
          >
            <Link to={`/projects/${project._id}`}>
              View Project
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard
