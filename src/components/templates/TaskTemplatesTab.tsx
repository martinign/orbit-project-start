
import React from 'react';
import { TaskTemplate } from '@/components/templates/types';
import TaskTemplateList from "@/components/TaskTemplateList";
import { Badge } from "@/components/ui/badge";

interface TaskTemplatesTabProps {
  templates: TaskTemplate[] | null;
  isLoading: boolean;
  searchQuery: string;
  selectionMode: boolean;
  onTemplateSelect?: (template: TaskTemplate, templateType: 'task') => void;
  onEdit?: (template: TaskTemplate) => void;
  onDelete?: (template: TaskTemplate) => void;
}

const TaskTemplatesTab: React.FC<TaskTemplatesTabProps> = ({ 
  templates, 
  isLoading, 
  searchQuery, 
  selectionMode,
  onTemplateSelect,
  onEdit,
  onDelete
}) => {
  // Filter templates based on search query
  const filteredTemplates = templates?.filter(template => 
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">Loading templates...</div>
    );
  }

  if (!filteredTemplates || filteredTemplates.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">
          {searchQuery ? "No templates match your search criteria" : "No templates found"}
        </p>
      </div>
    );
  }

  if (selectionMode) {
    return (
      <div className="space-y-4">
        {filteredTemplates.map((template) => (
          <div 
            key={template.id}
            className="border p-4 rounded-md hover:bg-gray-50 cursor-pointer"
            onClick={() => onTemplateSelect?.(template, 'task')}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{template.title}</h3>
              <Badge variant="secondary">User Template</Badge>
            </div>
            {template.description && (
              <p className="text-sm text-gray-500 mt-1">{template.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <TaskTemplateList 
      templates={filteredTemplates}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default TaskTemplatesTab;
