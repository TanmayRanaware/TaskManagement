import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Task } from '@/services/taskService'
import { useTaskStore } from '@/store/taskStore'
import Button from '@/components/common/Button'
import { 
  EllipsisVerticalIcon, 
  UserIcon, 
  CalendarIcon,
  ClockIcon,
  TagIcon
} from '@heroicons/react/24/outline'

interface TaskCardProps {
  task: Task
  onStatusChange: (newStatus: string) => void
}

const TaskCard = ({ task, onStatusChange }: TaskCardProps) => {
  const { updateTask, deleteTask } = useTaskStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500'
      case 'high':
        return 'border-l-orange-500'
      case 'medium':
        return 'border-l-yellow-500'
      case 'low':
        return 'border-l-green-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending'
      case 'in_progress':
        return 'status-in-progress'
      case 'completed':
        return 'status-completed'
      case 'cancelled':
        return 'status-cancelled'
      default:
        return 'status-pending'
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTask(task._id, { status: newStatus as any })
      onStatusChange(newStatus)
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await deleteTask(task._id)
      } catch (error) {
        // Error is handled by the store
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 0) return `In ${diffDays} days`
    return `${Math.abs(diffDays)} days ago`
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'

  return (
    <div
      className={`kanban-task ${getPriorityColor(task.priority)} ${getStatusColor(task.status)}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', task._id)
        e.dataTransfer.setData('currentStatus', task.status)
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
          {task.title}
        </h4>
        
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <EllipsisVerticalIcon className="h-4 w-4" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-600">
              <div className="py-1">
                <Link
                  to={`/tasks/${task._id}`}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  View Details
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleStatusChange('in_progress')
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Start Task
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleStatusChange('completed')
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Complete Task
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleDelete()
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Delete Task
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.slice(0, 3).map((label, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
            >
              <TagIcon className="h-3 w-3 mr-1" />
              {label}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{task.labels.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Subtasks */}
      {task.subtasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span>
              {task.subtasks.filter(st => st.completed).length} / {task.subtasks.length} subtasks
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1 mt-1">
            <div
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{
                width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          {task.assigneeId && (
            <div className="flex items-center">
              <UserIcon className="h-3 w-3 mr-1" />
              <span>Assigned</span>
            </div>
          )}
          
          {task.dueDate && (
            <div className={`flex items-center ${isOverdue ? 'text-red-500' : ''}`}>
              <CalendarIcon className="h-3 w-3 mr-1" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
          
          {task.estimatedHours && (
            <div className="flex items-center">
              <ClockIcon className="h-3 w-3 mr-1" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            task.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {task.priority}
          </span>
        </div>
      </div>
    </div>
  )
}

export default TaskCard
