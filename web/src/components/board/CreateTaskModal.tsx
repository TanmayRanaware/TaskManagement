import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTaskStore } from '@/store/taskStore'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { XMarkIcon, TagIcon } from '@heroicons/react/24/outline'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  projectId?: string
}

interface CreateTaskFormData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigneeId: string
  dueDate: string
  estimatedHours: number
  labels: string
}

const CreateTaskModal = ({ isOpen, onClose, projectId }: CreateTaskModalProps) => {
  const { createTask, isLoading } = useTaskStore()
  const [taskLabels, setTaskLabels] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTaskFormData>({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      assigneeId: '',
      dueDate: '',
      estimatedHours: 0,
      labels: '',
    },
  })

  const onSubmit = async (data: CreateTaskFormData) => {
    if (!projectId) {
      console.error('Project ID is required')
      return
    }

    try {
      await createTask({
        title: data.title,
        description: data.description || undefined,
        priority: data.priority,
        projectId,
        assigneeId: data.assigneeId || undefined,
        dueDate: data.dueDate || undefined,
        estimatedHours: data.estimatedHours || undefined,
        labels: taskLabels,
        subtasks: [],
      })
      
      reset()
      setTaskLabels([])
      onClose()
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleAddLabel = () => {
    const labelInput = document.getElementById('labels') as HTMLInputElement
    const label = labelInput.value.trim()
    
    if (label && !taskLabels.includes(label)) {
      setTaskLabels([...taskLabels, label])
      labelInput.value = ''
    }
  }

  const handleRemoveLabel = (index: number) => {
    setTaskLabels(taskLabels.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddLabel()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create New Task
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('title', {
                required: 'Task title is required',
                minLength: {
                  value: 1,
                  message: 'Task title must be at least 1 character',
                },
                maxLength: {
                  value: 200,
                  message: 'Task title cannot exceed 200 characters',
                },
              })}
              label="Task Title"
              placeholder="Enter task title"
              error={errors.title?.message}
              disabled={isLoading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                {...register('description', {
                  maxLength: {
                    value: 2000,
                    message: 'Description cannot exceed 2000 characters',
                  },
                })}
                placeholder="Enter task description (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  {...register('priority')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={isLoading}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <Input
                  {...register('estimatedHours', {
                    min: {
                      value: 0,
                      message: 'Estimated hours must be non-negative',
                    },
                    max: {
                      value: 999,
                      message: 'Estimated hours cannot exceed 999',
                    },
                  })}
                  type="number"
                  label="Estimated Hours"
                  placeholder="0"
                  error={errors.estimatedHours?.message}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register('assigneeId')}
                label="Assignee ID"
                placeholder="User ID (optional)"
                disabled={isLoading}
              />

              <Input
                {...register('dueDate')}
                type="datetime-local"
                label="Due Date"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Labels
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  id="labels"
                  type="text"
                  placeholder="Enter task label"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLabel}
                  disabled={isLoading}
                >
                  Add
                </Button>
              </div>
              {taskLabels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {taskLabels.map((label, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white"
                    >
                      <TagIcon className="h-3 w-3 mr-1" />
                      {label}
                      <button
                        type="button"
                        onClick={() => handleRemoveLabel(index)}
                        className="ml-1 text-white hover:text-gray-200"
                        disabled={isLoading}
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateTaskModal
