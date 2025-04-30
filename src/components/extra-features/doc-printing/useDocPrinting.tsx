
import { useState } from 'react';

interface TemplateOption {
  id: string;
  name: string;
}

export const useDocPrinting = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('project-docs');
  
  // Sample templates - in a real app, these would come from the database
  const projectDocTemplates = [
    { id: 'project-summary', name: 'Project Summary' },
    { id: 'contact-list', name: 'Contact List' },
    { id: 'task-report', name: 'Task Status Report' },
  ];
  
  const studyDocTemplates = [
    { id: 'protocol', name: 'Protocol Summary' },
    { id: 'site-status', name: 'Site Status Report' },
    { id: 'enrollment', name: 'Enrollment Report' },
  ];
  
  const adminDocTemplates = [
    { id: 'team-directory', name: 'Team Directory' },
    { id: 'workday-codes', name: 'Workday Codes List' },
    { id: 'project-timeline', name: 'Project Timeline' },
  ];

  // Get current templates based on active tab
  const getCurrentTemplates = (): TemplateOption[] => {
    switch (activeTab) {
      case 'project-docs':
        return projectDocTemplates;
      case 'study-docs':
        return studyDocTemplates;
      case 'admin-docs':
        return adminDocTemplates;
      default:
        return [];
    }
  };

  return {
    selectedTemplate,
    setSelectedTemplate,
    activeTab,
    setActiveTab,
    getCurrentTemplates,
    projectDocTemplates,
    studyDocTemplates,
    adminDocTemplates
  };
};
