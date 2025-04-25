import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { EventDialog } from './EventDialog';
import { Button } from '@/components/ui/button';
import { useProjectEvents } from '@/hooks/useProjectEvents';
import { CalendarCard } from './CalendarCard';
import { EventsGrid } from './EventsGrid';

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
        <CalendarCard
          selectedDate={selectedDate}
          onSelect={handleDateSelect}
          hasEditAccess={hasEditAccess}
          events={filteredEvents}
        />
        
        <EventsGrid
          events={filteredEvents}
          selectedDate={selectedDate}
          hasEditAccess={hasEditAccess}
          onDelete={(id) => deleteEvent.mutate(id)}
          onEdit={handleEditEvent}
          isLoading={eventsLoading}
        />
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
