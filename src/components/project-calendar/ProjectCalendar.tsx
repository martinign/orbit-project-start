import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
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
import { useUserProfile } from '@/hooks/useUserProfile';
import { useProjectEvents } from '@/hooks/useProjectEvents';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProjectCalendarProps {
  projectId: string;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  event_date: string | null;
}

interface TeamMember {
  id: string;
  full_name: string;
}

export function ProjectCalendar({ projectId }: ProjectCalendarProps) {
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { hasEditAccess, createEvent, deleteEvent, updateEvent } = useProjectEvents(projectId);

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['project_events', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_events')
        .select('*')
        .eq('project_id', projectId);

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

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    if (!hasEditAccess) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to create events.",
        variant: "destructive",
      });
      return;
    }

    setSelectedDate(date);
    setEditingEvent(null);
    setIsEventDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsEventDialogOpen(true);
  };

  const filteredEvents = events.filter(event => {
    if (!selectedUserId) return true;
    return event.user_id === selectedUserId;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
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

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>
              {hasEditAccess 
                ? "Click a date to create an event" 
                : "Select a date to view events"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className={cn(
                "pointer-events-auto",
                hasEditAccess && "hover:cursor-pointer"
              )}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEvents.map((event) => (
                    <EventWithCreator 
                      key={event.id} 
                      event={event}
                      onDelete={() => deleteEvent.mutate(event.id)} 
                      onEdit={() => handleEditEvent(event)}
                      hasEditAccess={hasEditAccess}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <EventDialog
        open={isEventDialogOpen}
        onClose={() => {
          setIsEventDialogOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={async (data) => {
          if (!data.title) {
            toast({
              title: 'Validation Error',
              description: 'Please fill in all required fields.',
              variant: 'destructive',
            });
            return;
          }

          if (editingEvent) {
            await updateEvent.mutateAsync({
              id: editingEvent.id,
              title: data.title,
              description: data.description,
              project_id: projectId,
              event_date: data.event_date?.toISOString(),
            });
          } else {
            await createEvent.mutateAsync({
              title: data.title,
              description: data.description,
              project_id: projectId,
              event_date: selectedDate?.toISOString(),
            });
          }
          setIsEventDialogOpen(false);
          setEditingEvent(null);
        }}
        mode={editingEvent ? 'edit' : 'create'}
        defaultValues={editingEvent ? {
          title: editingEvent.title,
          description: editingEvent.description || '',
          event_date: editingEvent.event_date ? new Date(editingEvent.event_date) : undefined,
        } : {
          title: '',
          description: '',
          event_date: selectedDate
        }}
      />
    </div>
  );
}

// Separate component to handle event creator display
function EventWithCreator({ 
  event, 
  onDelete,
  onEdit,
  hasEditAccess
}: { 
  event: Event;
  onDelete: () => void;
  onEdit: () => void;
  hasEditAccess: boolean;
}) {
  const { data: userProfile, isLoading } = useUserProfile(event.user_id);

  const getCreatorName = () => {
    if (isLoading) return 'Loading...';
    if (!userProfile) return 'Unknown User';
    return `${userProfile.full_name}${userProfile.last_name ? ' ' + userProfile.last_name : ''}`;
  };

  return (
    <div className="flex flex-col justify-between h-full p-4 border rounded-lg bg-card">
      <div>
        <h4 className="font-medium mb-2">{event.title}</h4>
        {event.description && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {event.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Created by: {getCreatorName()}
        </p>
        <p className="text-xs text-muted-foreground">
          Date: {event.event_date ? format(new Date(event.event_date), "MMMM d, yyyy") : "No date set"}
        </p>
      </div>
      {hasEditAccess && (
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )}
    </div>
  );
}
