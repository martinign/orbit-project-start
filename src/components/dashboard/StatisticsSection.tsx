
import React from 'react';
import { ProjectsStatisticsCard } from "@/components/dashboard/ProjectsStatisticsCard";
import { TasksStatisticsCard } from "@/components/dashboard/TasksStatisticsCard";
import { TaskPrioritiesCard } from "@/components/dashboard/TaskPrioritiesCard";
import { InvitationsStatisticsCard } from "@/components/dashboard/InvitationsStatisticsCard";

interface StatisticsSectionProps {
  filters: {
    projectId?: string;
    status?: string;
    category?: string;
    projectType?: string;
    showNewTasks?: boolean;
    showNewEvents?: boolean;
  };
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({ filters }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <ProjectsStatisticsCard filters={filters} />
      <TasksStatisticsCard filters={filters} />
      <TaskPrioritiesCard filters={filters} />
      <InvitationsStatisticsCard filters={filters} />
    </div>
  );
};
