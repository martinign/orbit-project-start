
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListTodo, CalendarDays, Users, FileText, UserRound, Mail, Link, Folder } from 'lucide-react';
import { useExtraFeatures } from '@/contexts/ExtraFeaturesContext';

interface ProjectContentTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

export const ProjectContentTabs: React.FC<ProjectContentTabsProps> = ({
  activeTab,
  onTabChange,
  children
}) => {
  const { selectedFeatures } = useExtraFeatures();
  
  // Prepare all standard tabs first
  const standardTabs = [
    { value: 'tasks', label: 'Tasks', icon: ListTodo },
    { value: 'notes', label: 'Notes', icon: FileText },
    { value: 'calendar', label: 'Calendar', icon: CalendarDays },
    { value: 'contacts', label: 'Contacts', icon: Users },
    { value: 'team', label: 'Team', icon: UserRound }
  ];
  
  // Map feature names to their tab configurations
  const featureTabs = {
    'site-initiation': { value: 'site-initiation', label: 'Site Initiation', icon: FileText },
    'important-links': { value: 'important-links', label: 'Links', icon: Link },
    'repository': { value: 'repository', label: 'Repository', icon: Folder }
  };
  
  // Filter feature tabs based on selected features
  const activeFeatureTabs = selectedFeatures.map(feature => featureTabs[feature as keyof typeof featureTabs]);
  
  // Invites tab is always last
  const invitesTab = { value: 'invites', label: 'Invites', icon: Mail };
  
  // Combine all tabs
  const allTabs = [...standardTabs, ...activeFeatureTabs, invitesTab];

  return (
    <Tabs defaultValue="tasks" value={activeTab} onValueChange={onTabChange}>
      <div className="overflow-x-auto pb-2">
        <TabsList className="inline-flex w-auto space-x-1">
          {allTabs.map(tab => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value} 
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.substring(0, 3)}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {children}
    </Tabs>
  );
};
