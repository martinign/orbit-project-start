
import { useState } from 'react';
import { useTemplates } from './useTemplates';

export const useDocPrinting = () => {
  const [activeTab, setActiveTab] = useState<string>('project-docs');
  const { 
    selectedTemplate, 
    setSelectedTemplate, 
    getTemplatesByCategory 
  } = useTemplates();
  
  // Get current templates based on active tab
  const getCurrentTemplates = () => {
    return getTemplatesByCategory(activeTab);
  };

  return {
    selectedTemplate,
    setSelectedTemplate,
    activeTab,
    setActiveTab,
    getCurrentTemplates,
  };
};
