
import React, { useEffect } from 'react';
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

const ProjectDetailsView = () => {
  const { id } = useParams<{ id: string }>();
  const { features, isLoading: featuresLoading } = useExtraFeatures(id);
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

  // Listen for extra features changes via storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'extraFeatures') {
        // Force a component update when extra features change
        setActiveTab(prev => prev === 'tasks' ? 'tasks' : 'tasks');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setActiveTab]);

  // If the user is viewing the invites tab but is not the project owner,
  // redirect them to the tasks tab
  useEffect(() => {
    if (activeTab === 'invites' && !isProjectOwner) {
      setActiveTab('tasks');
    }
  }, [activeTab, isProjectOwner, setActiveTab]);

  // Ensure features is never undefined
  const safeFeatures = features || {
    importantLinks: false,
    siteInitiationTracker: false,
    repository: false,
    docPrinting: false,
    billOfMaterials: false,
    designSheet: false
  };

  if (projectLoading) {
    return <div className="flex justify-center items-center h-64">Loading project details...</div>;
  }

  if (!project) {
    return <div className="text-center p-8">Project not found</div>;
  }

  return (
    <div className="space-y-6">
      <ProjectHeader
        projectNumber={project.project_number}
        protocolTitle={project.protocol_title}
        sponsor={project.Sponsor}
        protocolNumber={project.protocol_number}
        status={project.status}
        projectType={project.project_type}
      />

      <ProjectDescription description={project.description} />

      <ProjectStatisticsCards
        contactsCount={contactsCount}
        teamMembersCount={teamMembersCount}
        tasksStats={tasksStats}
        eventsCount={eventsCount}
        notesCount={notesCount}
        onTabChange={setActiveTab}
        projectId={id || ''}
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
        key={`tabs-${JSON.stringify(safeFeatures)}`}
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
          key={`content-${JSON.stringify(safeFeatures)}-${id}`}
        />
      </ProjectContentTabs>
    </div>
  );
};

export default ProjectDetailsView;
