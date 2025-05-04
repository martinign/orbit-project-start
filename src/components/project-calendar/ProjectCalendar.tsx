
import React from 'react';
import { CalendarHeader } from './CalendarHeader';
import { CalendarLayout } from './CalendarLayout';
import { EventDialog } from './EventDialog';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { EventsGrid } from './EventsGrid';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProjectCalendarProps {
  projectId: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ProjectCalendar: React.FC<ProjectCalendarProps> = ({ 
  projectId,
  searchQuery,
  setSearchQuery
}) => {
  const {
    selectedDate,
    setSelectedDate,
    selectedUserId,
    setSelectedUserId,
    editingEvent,
    setEditingEvent,
    isEventDialogOpen,
    setIsEventDialogOpen,
    events,
    teamMembers,
    eventsLoading,
    hasEditAccess,
    handleDateSelect,
    handleEditEvent,
    handleDeleteEvent,
    handleEventSubmit,
    user,
    lastUpdate
  } = useCalendarEvents(projectId);

  // Filter events based on search query
  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true;
    return (
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <CalendarHeader 
          selectedUserId={selectedUserId} 
          setSelectedUserId={setSelectedUserId}
          teamMembers={teamMembers}
        />
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events..."
            className="pl-8 h-9 text-sm w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <CalendarLayout 
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        events={filteredEvents}
      />

      <div className="mt-6">
        <EventsGrid
          events={filteredEvents}
          isLoading={eventsLoading}
          onDeleteEvent={handleDeleteEvent}
          onEditEvent={handleEditEvent}
          hasEditAccess={hasEditAccess}
          isAuthenticated={!!user}
          currentUserId={user?.id}
          lastUpdate={lastUpdate}
          searchQuery={searchQuery}
        />
      </div>

      <EventDialog
        isOpen={isEventDialogOpen}
        onClose={() => setIsEventDialogOpen(false)}
        onSubmit={handleEventSubmit}
        editingEvent={editingEvent}
        selectedDate={selectedDate}
      />
    </div>
  );
};
