
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { EventDialog } from './EventDialog';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectCalendarProps {
  projectId: string;
}

export function ProjectCalendar({ projectId }: ProjectCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Query to fetch events for this project
  const { data: events } = useQuery({
    queryKey: ['project_events', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_events')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId
  });

  // Event creation mutation
  const createEvent = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      // Fix the ambiguous column reference by explicitly specifying column names
      // without table prefixes in the insert statement
      const { data: insertedData, error } = await supabase
        .from('project_events')
        .insert([{
          project_id: projectId,
          title: data.title,
          description: data.description || null,
          user_id: user.id,
          start_date: selectedDate ? selectedDate.toISOString() : new Date().toISOString(),
          end_date: selectedDate ? selectedDate.toISOString() : new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error("Error creating event:", error);
        throw error;
      }
      
      return insertedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_events', projectId] });
      toast({
        title: 'Event created',
        description: 'Your event has been created successfully.',
      });
      setIsEventDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Error submitting form:", error);
      toast({
        title: 'Error',
        description: error.message || 'There was an error creating the event.',
        variant: 'destructive',
      });
    },
  });

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setIsEventDialogOpen(true);
    }
  };

  // Modify this function to match the expected type in EventDialog
  const handleSubmitEvent = async (data: { title: string; description?: string }): Promise<void> => {
    await createEvent.mutateAsync(data);
    // No return value needed - this matches the Promise<void> type
  };

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        className="border rounded-md"
      />
      
      <EventDialog
        open={isEventDialogOpen}
        onClose={() => setIsEventDialogOpen(false)}
        onSubmit={handleSubmitEvent}
        mode="create"
      />

      {events && events.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Upcoming Events</h3>
          <div className="space-y-2">
            {events.map((event) => (
              <div key={event.id} className="p-3 border rounded-md bg-gray-50">
                <h4 className="font-medium">{event.title}</h4>
                {event.description && <p className="text-sm text-gray-600">{event.description}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(event.start_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
