import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTaskStore } from '@/store/taskStore'
import { useProjectStore } from '@/store/projectStore'
import Column from './Column'
import CreateTaskModal from './CreateTaskModal'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { PlusIcon } from '@heroicons/react/24/outline'

const STATUSES = [
  { id: 'pending', title: 'To Do', color: 'bg-gray-100 dark:bg-gray-700' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900' },
  { id: 'completed', title: 'Done', color: 'bg-green-100 dark:bg-green-900' },
  { id: 'cancelled', title: 'Cancelled', color: 'bg-red-100 dark:bg-red-900' },
]

const KanbanBoard = () => {
  const { id: projectId } = useParams<{ id: string }>()
  const { tasks, isLoading, error, fetchProjectTasks, clearError } = useTaskStore()
  const { currentProject, fetchProjectById } = useProjectStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    if (projectId) {
      fetchProjectTasks(projectId)
      fetchProjectById(projectId)
    }
  }, [projectId, fetchProjectTasks, fetchProjectById])

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
  }

  const handleTaskMove = async (taskId: string, newStatus: string, newPosition: number) => {
    try {
      await useTaskStore.getState().updateTask(taskId, {
        status: newStatus as any,
        position: newPosition,
      })
    } catch (error) {
      // Error is handled by the store
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={() => clearError()}>Try Again</Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentProject?.name || 'Project Board'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {currentProject?.description || 'Manage your tasks with a visual board'}
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex space-x-6 overflow-x-auto pb-6">
        {STATUSES.map((status) => (
          <Column
            key={status.id}
            status={status}
            tasks={getTasksByStatus(status.id)}
            onTaskMove={handleTaskMove}
            onCreateTask={() => setIsCreateModalOpen(true)}
          />
        ))}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId}
      />
    </div>
  )
}

export default KanbanBoard
