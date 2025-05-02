
import React from 'react';
import { Users, UserRound, ListTodo, CalendarDays, FileText } from 'lucide-react';
import { useNewItems } from '@/hooks/useNewItems';
import { StatisticCard } from './statistics/StatisticCard';
import { TaskStatisticCard } from './statistics/TaskStatisticCard';
import { RealtimeUpdatesManager } from './statistics/RealtimeUpdatesManager';
import { ExtraFeaturesCard } from './ExtraFeaturesCard';

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

  return (
    <>
      <RealtimeUpdatesManager projectId={projectId} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <ExtraFeaturesCard 
          projectId={projectId} 
          onClick={() => onTabChange('extraFeatures')}
        />

        <TaskStatisticCard
          tasksStats={tasksStats}
          newItemsCount={newItemsCount.task}
          onTabChange={() => onTabChange('tasks')}
        />

        <StatisticCard
          title="Notes"
          value={notesCount}
          icon={<FileText className="h-8 w-8" />}
          iconColor="text-orange-500"
          onClick={() => onTabChange('notes')}
          newItemsCount={newItemsCount.note}
        />

        <StatisticCard
          title="Events"
          value={eventsCount}
          icon={<CalendarDays className="h-8 w-8" />}
          iconColor="text-blue-500"
          onClick={() => onTabChange('calendar')}
          newItemsCount={newItemsCount.event}
        />
        
        <StatisticCard
          title="Contacts"
          value={contactsCount}
          icon={<Users className="h-8 w-8" />}
          iconColor="text-blue-500"
          onClick={() => onTabChange('contacts')}
          newItemsCount={newItemsCount.contact}
        />

        <StatisticCard
          title="Team Members"
          value={teamMembersCount}
          icon={<UserRound className="h-8 w-8" />}
          iconColor="text-purple-500"
          onClick={() => onTabChange('team')}
        />
      </div>
    </>
  );
};
