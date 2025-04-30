
import { useState } from 'react';
import { TemplateOption, projectDocTemplates, studyDocTemplates, adminDocTemplates } from './templates';

export const useTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Get current templates based on active tab
  const getTemplatesByCategory = (category: string): TemplateOption[] => {
    switch (category) {
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
    getTemplatesByCategory,
    projectDocTemplates,
    studyDocTemplates,
    adminDocTemplates
  };
};
