
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { EventDialog } from './EventDialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile'; // Import the hook

interface ProjectCalendarProps {
  projectId: string;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
}

interface TeamMember {
  id: string;
  full_name: string;
}

export function ProjectCalendar({ projectId }: ProjectCalendarProps) {
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Get the current authenticated user

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['project_events', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_events')
        .select('*')
        .eq('project_id', projectId)

      if (error) throw error;
      return data as Event[];
    },
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['project_team_members', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_team_members')
        .select('id, full_name')
        .eq('project_id', projectId);

      if (error) throw error;
      return data as TeamMember[];
    },
  });

  const createEvent = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase.from('project_events').insert({
        project_id: projectId,
        title: data.title,
        description: data.description,
        user_id: user.id, // Add the current user ID
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_events', projectId] });
      toast({
        title: 'Event created',
        description: 'Your event has been created successfully.',
      });
      setIsEventDialogOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'There was an error creating the event.',
        variant: 'destructive',
      });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('project_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_events', projectId] });
      toast({
        title: 'Event deleted',
        description: 'The event has been deleted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'There was an error deleting the event.',
        variant: 'destructive',
      });
    },
  });

  const filteredEvents = events.filter(event => {
    if (!selectedUserId) return true;
    return event.user_id === selectedUserId;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedUserId ? 
                  teamMembers.find(m => m.id === selectedUserId)?.full_name || 'All Events' 
                  : 'All Events'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedUserId(null)}>
                All Events
              </DropdownMenuItem>
              {teamMembers.map((member) => (
                <DropdownMenuItem
                  key={member.id}
                  onClick={() => setSelectedUserId(member.id)}
                >
                  {member.full_name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button 
          onClick={() => setIsEventDialogOpen(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view events</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="pointer-events-auto"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'All events'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventsLoading ? (
                <p>Loading events...</p>
              ) : filteredEvents.length === 0 ? (
                <p className="text-muted-foreground">No events found</p>
              ) : (
                filteredEvents.map((event) => (
                  <EventWithCreator 
                    key={event.id} 
                    event={event} 
                    onDelete={() => deleteEvent.mutate(event.id)} 
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <EventDialog
        open={isEventDialogOpen}
        onClose={() => setIsEventDialogOpen(false)}
        onSubmit={async (data) => {
          // Ensure data has required properties
          if (!data.title) {
            toast({
              title: 'Validation Error',
              description: 'Please fill in all required fields.',
              variant: 'destructive',
            });
            return;
          }
          await createEvent.mutateAsync({
            title: data.title,
            description: data.description,
          });
        }}
        mode="create"
      />
    </div>
  );
}

// Separate component to handle event creator display
function EventWithCreator({ 
  event, 
  onDelete 
}: { 
  event: Event, 
  onDelete: () => void 
}) {
  const { data: userProfile, isLoading } = useUserProfile(event.user_id);

  const getCreatorName = () => {
    if (isLoading) return 'Loading...';
    if (!userProfile) return 'Unknown User';
    return `${userProfile.full_name}${userProfile.last_name ? ' ' + userProfile.last_name : ''}`;
  };

  return (
    <div
      className="flex items-center justify-between p-4 border rounded-lg"
    >
      <div>
        <h4 className="font-medium">{event.title}</h4>
        {event.description && (
          <p className="text-sm text-muted-foreground">
            {event.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Created by: {getCreatorName()}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
}
