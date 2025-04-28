import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

export interface Subtask {
  id: string
  title: string
  description?: string
  status: string
  due_date?: string | null
  parent_task_id: string
  notes?: string
  assigned_to?: string | null
  user_id: string
}

export interface Task {
  id: string
  title: string
}

type Mode = 'create' | 'edit'

export function useSubtaskForm(
  parentTask: Task | null,
  subtask?: Subtask,
  mode: Mode = 'create',
  onSuccess?: () => void
) {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const parentTaskId = parentTask?.id

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('not started')
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [notes, setNotes] = useState('')
  const [assignedTo, setAssignedTo] = useState<string | null>(null)

  // Initialize when editing
  useEffect(() => {
    if (mode === 'edit' && subtask) {
      setTitle(subtask.title)
      setDescription(subtask.description ?? '')
      setStatus(subtask.status)
      setNotes(subtask.notes ?? '')
      setAssignedTo(subtask.assigned_to ?? null)
      setDueDate(subtask.due_date ? new Date(subtask.due_date) : undefined)
    } else {
      setTitle('')
      setDescription('')
      setStatus('not started')
      setNotes('')
      setAssignedTo(null)
      setDueDate(undefined)
    }
    // We only want to reset when mode or subtask changes:
  }, [mode, subtask])

  // Common subtask payload builder
  const buildPayload = useCallback(() => {
    if (!parentTaskId) {
      throw new Error('Parent task is required')
    }
    if (!user) {
      throw new Error('User must be authenticated')
    }
    if (!title.trim()) {
      throw new Error('Title is required')
    }

    return {
      title: title.trim(),
      description: description.trim() || null,
      status,
      parent_task_id: parentTaskId,
      notes: notes.trim() || null,
      due_date: dueDate ? dueDate.toISOString() : null,
      assigned_to: assignedTo,
      user_id: user.id,
    }
  }, [parentTaskId, user, title, description, status, notes, dueDate, assignedTo])

  // CREATE mutation
  const createMutation = useMutation<Subtask, Error>(async () => {
    const payload = buildPayload()
    const { data, error } = await supabase
      .from<Subtask>('project_subtasks')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return data
  }, {
    onMutate: async (newSubtask) => {
      await queryClient.cancelQueries(['project_subtasks', parentTaskId])
      const previous = queryClient.getQueryData<Subtask[]>(['project_subtasks', parentTaskId])
      const optimistic: Subtask = {
        id: `temp-${Date.now()}`,
        ...newSubtask,
      } as Subtask
      queryClient.setQueryData(['project_subtasks', parentTaskId], old => old ? [...old, optimistic] : [optimistic])
      return { previous }
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['project_subtasks', parentTaskId], context?.previous)
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project_subtasks', parentTaskId])
      toast({ title: 'Success', description: 'Subtask created.' })
      onSuccess?.()
    }
  })

  // UPDATE mutation
  const updateMutation = useMutation<Subtask, Error>(async () => {
    if (!subtask?.id) throw new Error('Subtask ID is missing')
    const payload = buildPayload()
    const { data, error } = await supabase
      .from<Subtask>('project_subtasks')
      .update(payload)
      .eq('id', subtask.id)
      .select()
      .single()

    if (error) throw error
    return data
  }, {
    onMutate: async () => {
      await queryClient.cancelQueries(['project_subtasks', parentTaskId])
      const previous = queryClient.getQueryData<Subtask[]>(['project_subtasks', parentTaskId])
      queryClient.setQueryData(['project_subtasks', parentTaskId], old =>
        old?.map(s => s.id === subtask?.id ? { ...s, ...buildPayload() } : s) ?? []
      )
      return { previous }
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['project_subtasks', parentTaskId], context?.previous)
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project_subtasks', parentTaskId])
      toast({ title: 'Success', description: 'Subtask updated.' })
      onSuccess?.()
    }
  })

  // Combined submit handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (mode === 'edit') {
        await updateMutation.mutateAsync()
      } else {
        await createMutation.mutateAsync()
      }
    } catch {
      // Errors are handled in onError
    }
  }, [mode, createMutation, updateMutation])

  return {
    // form state + setters
    title, setTitle,
    description, setDescription,
    status, setStatus,
    dueDate, setDueDate,
    notes, setNotes,
    assignedTo, setAssignedTo,

    // submit state + handler
    isSubmitting: createMutation.isLoading || updateMutation.isLoading,
    handleSubmit,

    // mutation objects in case you need more
    createMutation,
    updateMutation,
  }
}
