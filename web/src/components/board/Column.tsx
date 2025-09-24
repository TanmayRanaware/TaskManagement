import { useState } from 'react'
import { Task } from '@/services/taskService'
import TaskCard from './TaskCard'
import Button from '@/components/common/Button'
import { PlusIcon } from '@heroicons/react/24/outline'

interface ColumnProps {
  status: {
    id: string
    title: string
    color: string
  }
  tasks: Task[]
  onTaskMove: (taskId: string, newStatus: string, newPosition: number) => void
  onCreateTask: () => void
}

const Column = ({ status, tasks, onTaskMove, onCreateTask }: ColumnProps) => {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const taskId = e.dataTransfer.getData('taskId')
    const currentStatus = e.dataTransfer.getData('currentStatus')
    
    if (taskId && currentStatus !== status.id) {
      const newPosition = tasks.length
      onTaskMove(taskId, status.id, newPosition)
    }
  }

  return (
    <div
      className={`kanban-column min-w-80 ${isDragOver ? 'drop-zone-active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${status.color}`} />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {status.title}
          </h3>
          <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateTask}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-sm">No tasks</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateTask}
              className="mt-2"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add task
            </Button>
          </div>
        ) : (
          tasks
            .sort((a, b) => a.position - b.position)
            .map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={(newStatus) => {
                  const newPosition = tasks.filter(t => t.status === newStatus).length
                  onTaskMove(task._id, newStatus, newPosition)
                }}
              />
            ))
        )}
      </div>
    </div>
  )
}

export default Column
