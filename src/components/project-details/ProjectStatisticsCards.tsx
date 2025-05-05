
import React, { useState, useEffect } from 'react';
import { Users, UserRound, ListTodo, CalendarDays, FileText, Building } from 'lucide-react';
import { useNewItems } from '@/hooks/useNewItems';
import { StatisticCard } from './statistics/StatisticCard';
import { TaskStatisticCard } from './statistics/TaskStatisticCard';
import { SiteProgressCard } from './statistics/SiteProgressCard';
import { RealtimeUpdatesManager } from './statistics/RealtimeUpdatesManager';
import { ExtraFeaturesCard } from './ExtraFeaturesCard';
import { ExtraFeaturesDialog } from '@/components/dashboard/ExtraFeaturesDialog';
import { useAllSitesData } from '@/hooks/site-initiation/useAllSitesData';
import { ExtraFeaturesState } from '@/hooks/useExtraFeatures';
import { getUniqueSiteReferences } from '@/hooks/site-initiation/siteUtils';

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
  extraFeatures?: ExtraFeaturesState;
}

export const ProjectStatisticsCards: React.FC<ProjectStatisticsCardsProps> = ({
  contactsCount,
  teamMembersCount,
  tasksStats,
  eventsCount,
  notesCount,
  onTabChange,
  projectId,
  extraFeatures = { siteInitiationTracker: false },
}) => {
  const { newItemsCount } = useNewItems(projectId);
  const [featuresDialogOpen, setFeaturesDialogOpen] = useState(false);
  
  // Fetch site data if the site initiation feature is enabled
  const { allSites, loading: sitesLoading } = useAllSitesData(
    extraFeatures?.siteInitiationTracker ? projectId : undefined
  );
  
  // Get unique site references
  const uniqueSiteReferences = getUniqueSiteReferences(allSites);
  
  // Count sites with starter packs (one per reference number)
  const sitesWithStarterPack = uniqueSiteReferences.filter(reference => {
    // Find if any site with this reference has a starter pack
    return allSites.some(site => 
      site.pxl_site_reference_number === reference && site.starter_pack
    );
  }).length;
  
  // Total unique site references
  const totalUniqueSites = uniqueSiteReferences.length;

  return (
    <>
      <RealtimeUpdatesManager projectId={projectId} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
        <ExtraFeaturesCard 
          projectId={projectId} 
          onClick={() => setFeaturesDialogOpen(true)}
        />

        <TaskStatisticCard
          tasksStats={tasksStats}
          newItemsCount={newItemsCount.task}
          onTabChange={() => onTabChange('tasks')}
        />

        {extraFeatures?.siteInitiationTracker && (
          <SiteProgressCard
            totalSites={totalUniqueSites}
            completedSites={sitesWithStarterPack}
            onClick={() => onTabChange('site-initiation')}
          />
        )}

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

      <ExtraFeaturesDialog 
        open={featuresDialogOpen}
        onOpenChange={setFeaturesDialogOpen}
        projectId={projectId}
      />
    </>
  );
};
