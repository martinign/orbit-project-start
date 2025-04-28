import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

interface ProjectEvent {
  id: string
  title: string
  description: string | null
  event_date: string | null
  created_at: string
  user_id: string
  project_id: string
  projects?: {
    project_number: string
    Sponsor: string
  }
}

interface EventInput {
  title: string
  description?: string
  event_date?: string
  project_id: string
}

export function useProjectEvents(projectId: string) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // 1) Check edit access
  const {
    data: hasEditAccess,
    isLoading: isLoadingAccess,
    isError: isErrorAccess,
  } = useQuery<boolean>({
    queryKey: ['project_edit_access', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('has_project_edit_access', { project_id: projectId })
      if (error) throw error
      return !!data
    },
    enabled: !!projectId,
    staleTime: 60_000,
  })

  // 2) Fetch events list
  const {
    data: events = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<ProjectEvent[]>({
    queryKey: ['project_events', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from<ProjectEvent>('project_events')
        .select(`*, projects (project_number, Sponsor)`)
        .eq('project_id', projectId)
        .order('event_date', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!projectId,
    staleTime: 30_000,
  })

  // 3) Realtime subscription for this project's events
  useEffect(() => {
    if (!projectId) return

    const channel = supabase
      .channel(`project_events_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_events',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          queryClient.invalidateQueries(['project_events', projectId])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, queryClient])

  // 4a) createEvent mutation with optimistic update
  const createEvent = useMutation<ProjectEvent, Error, EventInput>({
    mutationFn: async (input) => {
      if (!user) throw new Error('User not authenticated')
      const { data, error } = await supabase
        .from<ProjectEvent>('project_events')
        .insert({ ...input, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onMutate: async (newEvent) => {
      await queryClient.cancelQueries(['project_events', projectId])
      const previous = queryClient.getQueryData<ProjectEvent[]>(['project_events', projectId])
      const optimistic: ProjectEvent = {
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        user_id: user!.id,
        ...newEvent,
      }
      queryClient.setQueryData<ProjectEvent[]>(['project_events', projectId], old =>
        old ? [...old, optimistic] : [optimistic]
      )
      return { previous }
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['project_events', projectId], context?.previous)
      toast({ title: 'Error', description: 'Failed to create event.', variant: 'destructive' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project_events', projectId])
      toast({ title: 'Event created', description: 'Successfully created.' })
    },
  })

  // 4b) updateEvent mutation
  const updateEvent = useMutation<ProjectEvent, Error, ProjectEvent>({
    mutationFn: async ({ id, ...rest }) => {
      const { data, error } = await supabase
        .from<ProjectEvent>('project_events')
        .update(rest)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onMutate: async (updated) => {
      await queryClient.cancelQueries(['project_events', projectId])
      const previous = queryClient.getQueryData<ProjectEvent[]>(['project_events', projectId])
      queryClient.setQueryData(['project_events', projectId], old =>
        old?.map(e => (e.id === updated.id ? { ...e, ...updated } : e)) || []
      )
      return { previous }
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['project_events', projectId], context?.previous)
      toast({ title: 'Error', description: 'Failed to update event.', variant: 'destructive' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project_events', projectId])
      toast({ title: 'Event updated', description: 'Successfully updated.' })
    },
  })

  // 4c) deleteEvent mutation
  const deleteEvent = useMutation<string, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from<ProjectEvent>('project_events')
        .delete()
        .eq('id', id)
      if (error) throw error
      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries(['project_events', projectId])
      const previous = queryClient.getQueryData<ProjectEvent[]>(['project_events', projectId])
      queryClient.setQueryData(['project_events', projectId], old =>
        old?.filter(e => e.id !== id) || []
      )
      return { previous }
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['project_events', projectId], context?.previous)
      toast({ title: 'Error', description: 'Failed to delete event.', variant: 'destructive' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project_events', projectId])
      toast({ title: 'Event deleted', description: 'Successfully deleted.' })
    },
  })

  return {
    events,
    isLoading,
    isError,
    refetch,
    hasEditAccess,
    isLoadingAccess,
    isErrorAccess,
    createEvent,
    updateEvent,
    deleteEvent,
  }
}
