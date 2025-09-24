import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useProjectStore } from '@/store/projectStore'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

interface CreateProjectFormData {
  name: string
  description: string
  color: string
  isPublic: boolean
  allowMemberInvites: boolean
  defaultTaskStatus: string
  taskLabels: string
}

const CreateProjectModal = ({ isOpen, onClose }: CreateProjectModalProps) => {
  const { createProject, isLoading } = useProjectStore()
  const [taskLabels, setTaskLabels] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateProjectFormData>({
    defaultValues: {
      name: '',
      description: '',
      color: '#3b82f6',
      isPublic: false,
      allowMemberInvites: true,
      defaultTaskStatus: 'pending',
      taskLabels: '',
    },
  })

  const watchedColor = watch('color')

  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      await createProject({
        name: data.name,
        description: data.description || undefined,
        color: data.color,
        settings: {
          isPublic: data.isPublic,
          allowMemberInvites: data.allowMemberInvites,
          defaultTaskStatus: data.defaultTaskStatus,
          taskLabels: taskLabels,
        },
      })
      
      reset()
      setTaskLabels([])
      onClose()
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleAddLabel = () => {
    const labelInput = document.getElementById('taskLabels') as HTMLInputElement
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
              Create New Project
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
              {...register('name', {
                required: 'Project name is required',
                minLength: {
                  value: 1,
                  message: 'Project name must be at least 1 character',
                },
                maxLength: {
                  value: 100,
                  message: 'Project name cannot exceed 100 characters',
                },
              })}
              label="Project Name"
              placeholder="Enter project name"
              error={errors.name?.message}
              disabled={isLoading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                {...register('description', {
                  maxLength: {
                    value: 500,
                    message: 'Description cannot exceed 500 characters',
                  },
                })}
                placeholder="Enter project description (optional)"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  {...register('color')}
                  type="color"
                  className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  disabled={isLoading}
                />
                <div
                  className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: watchedColor }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {watchedColor}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task Labels
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  id="taskLabels"
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

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  {...register('isPublic')}
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded"
                  disabled={isLoading}
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Make project public
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('allowMemberInvites')}
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded"
                  disabled={isLoading}
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Allow members to invite others
                </label>
              </div>
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
                  'Create Project'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateProjectModal
