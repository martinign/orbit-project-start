
import React from 'react';
import { Users, UserRound, ListTodo, CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProjectStatisticsCardsProps {
  contactsCount: number;
  teamMembersCount: number;
  tasksStats: {
    total: number;
    completed: number;
    inProgress: number;
  };
  eventsCount: number;
  onTabChange: (tab: string) => void;
}

export const ProjectStatisticsCards: React.FC<ProjectStatisticsCardsProps> = ({
  contactsCount,
  teamMembersCount,
  tasksStats,
  eventsCount,
  onTabChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      <Card 
        className="cursor-pointer transition-colors hover:bg-accent"
        onClick={() => onTabChange('tasks')}
      >
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
        className="cursor-pointer transition-colors hover:bg-accent"
        onClick={() => onTabChange('calendar')}
      >
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
    </div>
  );
};
