
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

  // Event creation mutation
  const createEvent = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      // Use explicit field names with table prefixes to avoid ambiguity
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

  const handleSubmitEvent = async (data: { title: string; description?: string }) => {
    return createEvent.mutateAsync(data);
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
    </div>
  );
}
