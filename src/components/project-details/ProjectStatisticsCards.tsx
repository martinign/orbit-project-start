
import React from 'react';
import { Users, UserRound, ListTodo, CalendarDays, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNewItems } from '@/hooks/useNewItems';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProjectStatisticsCardsProps {
  contactsCount: number;
  teamMembersCount: number;
  tasksStats: {
    total: number;
    completed: number;
    inProgress: number;
  };
  eventsCount: number;
  notesCount: number;
  onTabChange: (tab: string) => void;
  projectId: string;
}

export const ProjectStatisticsCards: React.FC<ProjectStatisticsCardsProps> = ({
  contactsCount,
  teamMembersCount,
  tasksStats,
  eventsCount,
  notesCount,
  onTabChange,
  projectId,
}) => {
  const { newItemsCount } = useNewItems(projectId);
  const queryClient = useQueryClient();

  useEffect(() => {
    const tables = ['project_tasks', 'project_notes', 'project_events'];
    const channels = tables.map(table => {
      const channel = supabase.channel(`stats_${table}_${projectId}`);
      
      channel
        .on('postgres_changes',
          {
            event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table,
            filter: `project_id=eq.${projectId}`
          },
          (payload) => {
            console.log(`Stats change detected for ${table}:`, payload);
            // Invalidate relevant queries when data changes
            if (table === 'project_tasks') {
              queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
              queryClient.invalidateQueries({ queryKey: ['new_items_count', projectId] });
              queryClient.invalidateQueries({ queryKey: ['notes', projectId] });
              queryClient.invalidateQueries({ queryKey: ['new_items_count', projectId] });
            } else if (table === 'project_events') {
              queryClient.invalidateQueries({ queryKey: ['project_events_count', projectId] });
              queryClient.invalidateQueries({ queryKey: ['new_items_count', projectId] });
            }
          }
        )
        .subscribe();

      return channel;
    });

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [projectId, queryClient]);

  const renderBadge = (type: 'task' | 'note' | 'event') => {
    const count = newItemsCount[type];
    if (!count) return null;
    
    const timeAgo = format(new Date(Date.now() - 24 * 60 * 60 * 1000), 'pp');
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge 
              variant="success" 
              className="absolute top-2 right-2 animate-in fade-in"
            >
              {count} new
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Added since {timeAgo}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card 
        className="cursor-pointer transition-colors hover:bg-accent relative"
        onClick={() => onTabChange('tasks')}
      >
        {renderBadge('task')}
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tasks</p>
              <p className="text-2xl font-bold">{tasksStats.total}</p>
              <div className="flex gap-2 mt-1 text-xs">
                <span className="text-green-600">
                  {tasksStats.completed} Completed
                </span>
                <span className="text-blue-600">
                  {tasksStats.inProgress} In Progress
                </span>
              </div>
            </div>
            <ListTodo className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>


      <Card 
        className="cursor-pointer transition-colors hover:bg-accent relative"
        onClick={() => onTabChange('notes')}
      >
        {renderBadge('note')}
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="text-2xl font-bold">{notesCount.total}</p>
            </div>
            <FileText className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer transition-colors hover:bg-accent relative"
        onClick={() => onTabChange('calendar')}
      >
        {renderBadge('event')}
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Events</p>
              <p className="text-2xl font-bold">{eventsCount}</p>
            </div>
            <CalendarDays className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>      
      <Card 
        className="cursor-pointer transition-colors hover:bg-accent"
        onClick={() => onTabChange('contacts')}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Contacts</p>
              <p className="text-2xl font-bold">{contactsCount}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer transition-colors hover:bg-accent"
        onClick={() => onTabChange('team')}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Team Members</p>
              <p className="text-2xl font-bold">{teamMembersCount}</p>
            </div>
            <UserRound className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
