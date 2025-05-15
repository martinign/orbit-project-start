
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useExtraFeatures } from '@/hooks/useExtraFeatures';
import { ProjectHeader } from './project-details/ProjectHeader';
import { ProjectStatisticsCards } from './project-details/ProjectStatisticsCards';
import { ProjectContentTabs } from './project-details/ProjectContentTabs';
import { ProjectTabsContent } from './project-details/ProjectTabsContent';
import { ProjectDescription } from './project-details/ProjectDescription';
import { ProjectTimeline } from './project-details/ProjectTimeline';
import { useProjectDetails } from './project-details/useProjectDetails';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const ProjectDetailsView = () => {
  const { id } = useParams<{ id: string }>();
  const { features, isLoading: featuresLoading } = useExtraFeatures(id);
  const [localFeatures, setLocalFeatures] = useState(features);
  const { user } = useAuth();
  
  const {
    project,
    projectLoading,
    contactsCount,
    teamMembersCount,
    tasks,
    tasksLoading,
    refetchTasks,
    eventsCount,
    notesCount,
    tasksStats,
    activeTab,
    setActiveTab,
    contactSearchQuery,
    setContactSearchQuery
  } = useProjectDetails(id);

  // Check if the current user is the project owner
  const isProjectOwner = user?.id === project?.user_id;

  // Get the creator's profile information
  const { data: creatorProfile } = useUserProfile(project?.user_id);
  
  // Counter to force re-render of tabs when features change
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);

  // Keep local features in sync
  useEffect(() => {
    setLocalFeatures(features);
  }, [features]);

  // Listen for extra features changes via storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'extraFeatures') {
        // Force a component update when extra features change
        setForceUpdateCounter(prev => prev + 1);
      }
    };
    
    const handleFeatureUpdate = (e: CustomEvent) => {
      if (e.detail && e.detail.projectId === id) {
        setLocalFeatures(e.detail.features);
        setForceUpdateCounter(prev => prev + 1);
      }
    };
    
    const handleExtraFeaturesChanged = (e: CustomEvent) => {
      if (e.detail && e.detail.projectId === id) {
        setLocalFeatures(e.detail.features);
        setForceUpdateCounter(prev => prev + 1);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('featureUpdate', handleFeatureUpdate as EventListener);
    document.addEventListener('extraFeaturesChanged', handleExtraFeaturesChanged as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('featureUpdate', handleFeatureUpdate as EventListener);
      document.removeEventListener('extraFeaturesChanged', handleExtraFeaturesChanged as EventListener);
    };
  }, [id, setActiveTab]);

  // If the user is viewing the invites tab but is not the project owner,
  // redirect them to the tasks tab
  useEffect(() => {
    if (activeTab === 'invites' && !isProjectOwner) {
      setActiveTab('tasks');
    }
  }, [activeTab, isProjectOwner, setActiveTab]);

  // Ensure features is never undefined
  const safeFeatures = localFeatures || {
    importantLinks: false,
    siteInitiationTracker: false,
    docPrinting: false,
    billOfMaterials: false,
    designSheet: false,
    workdayScheduled: false,
    vacationTracker: false
  };

  if (projectLoading) {
    return <div className="flex justify-center items-center h-64">Loading project details...</div>;
  }

  if (!project) {
    return <div className="text-center p-8">Project not found</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <ProjectHeader
        projectNumber={project.project_number}
        protocolTitle={project.protocol_title}
        sponsor={project.Sponsor}
        protocolNumber={project.protocol_number}
        status={project.status}
        projectType={project.project_type}
      />

      <div className="flex-1 overflow-y-auto pt-6 px-6 pb-8 space-y-8">
        <ProjectDescription description={project.description} />

        <ProjectStatisticsCards
          contactsCount={contactsCount}
          teamMembersCount={teamMembersCount}
          tasksStats={tasksStats}
          eventsCount={eventsCount}
          notesCount={notesCount}
          onTabChange={setActiveTab}
          projectId={id || ''}
          extraFeatures={safeFeatures}
        />

        <ProjectTimeline
          createdAt={project.created_at}
          creatorProfile={creatorProfile}
        />

        <ProjectContentTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          extraFeatures={safeFeatures}
          isProjectOwner={isProjectOwner}
          key={`tabs-${forceUpdateCounter}-${JSON.stringify(safeFeatures)}`}
        >
          <ProjectTabsContent
            activeTab={activeTab}
            projectId={id || ''}
            tasks={tasks}
            tasksLoading={tasksLoading}
            refetchTasks={refetchTasks}
            contactSearchQuery={contactSearchQuery}
            setContactSearchQuery={setContactSearchQuery}
            extraFeatures={safeFeatures}
            key={`content-${forceUpdateCounter}-${JSON.stringify(safeFeatures)}-${id}`}
          />
        </ProjectContentTabs>
      </div>
    </div>
  );
};

export default ProjectDetailsView;
