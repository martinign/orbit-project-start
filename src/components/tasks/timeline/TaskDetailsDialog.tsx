// src/components/tasks/timeline/TaskDetailsDialog.tsx
import React from 'react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface Task {
  id: string
  title: string
  status: string
  created_at: string | null
  updated_at: string | null
  description?: string
  priority?: string
}

interface TaskDetailsDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  task,
  open,
  onOpenChange,
}) => {
  if (!task) return null

  const statusColor = () => {
    switch (task.status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in progress':
        return 'bg-blue-100 text-blue-800'
      case 'stucked':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  const priorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={statusColor()}>
              {task.status}
            </Badge>
            {task.priority && (
              <Badge variant="outline" className={priorityColor()}>
                {task.priority} priority
              </Badge>
            )}
          </div>
          {task.description && (
            <div>
              <h4 className="text-sm font-medium">Description</h4>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {task.created_at
                ? format(new Date(task.created_at), 'PPP')
                : 'N/A'}
            </div>
            {task.status === 'completed' && task.updated_at && (
              <div>
                <span className="font-medium">Completed:</span>{' '}
                {format(new Date(task.updated_at), 'PPP')}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
