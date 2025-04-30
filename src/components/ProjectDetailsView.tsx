
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

const ProjectDetailsView = () => {
  const { id } = useParams<{ id: string }>();
  const { features } = useExtraFeatures();
  
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
  }, []);

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
        extraFeatures={features}
        key={`tabs-${JSON.stringify(features)}`}
      >
        <ProjectTabsContent
          activeTab={activeTab}
          projectId={id || ''}
          tasks={tasks}
          tasksLoading={tasksLoading}
          refetchTasks={refetchTasks}
          contactSearchQuery={contactSearchQuery}
          setContactSearchQuery={setContactSearchQuery}
          extraFeatures={features}
          key={`content-${JSON.stringify(features)}`}
        />
      </ProjectContentTabs>
    </div>
  );
};

export default ProjectDetailsView;
