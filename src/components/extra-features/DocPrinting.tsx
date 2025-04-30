
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocPrintingTemplates } from './doc-printing/DocPrintingTemplates';
import { DocPrintingActions } from './doc-printing/DocPrintingActions';
import { useDocPrinting } from './doc-printing/useDocPrinting';

interface DocPrintingProps {
  projectId?: string;
}

export const DocPrinting: React.FC<DocPrintingProps> = ({ projectId }) => {
  const { user } = useAuth();
  const { 
    selectedTemplate,
    setSelectedTemplate,
    activeTab,
    setActiveTab,
    getCurrentTemplates
  } = useDocPrinting();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Document Printing</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="project-docs" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="project-docs">Project Documents</TabsTrigger>
              <TabsTrigger value="study-docs">Study Documents</TabsTrigger>
              <TabsTrigger value="admin-docs">Administrative</TabsTrigger>
            </TabsList>
            
            <TabsContent value="project-docs" className="space-y-4">
              <div className="space-y-4">
                <DocPrintingTemplates
                  templates={getCurrentTemplates()}
                  selectedTemplate={selectedTemplate}
                  setSelectedTemplate={setSelectedTemplate}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="study-docs" className="space-y-4">
              <div className="space-y-4">
                <DocPrintingTemplates
                  templates={getCurrentTemplates()}
                  selectedTemplate={selectedTemplate}
                  setSelectedTemplate={setSelectedTemplate}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="admin-docs" className="space-y-4">
              <div className="space-y-4">
                <DocPrintingTemplates
                  templates={getCurrentTemplates()}
                  selectedTemplate={selectedTemplate}
                  setSelectedTemplate={setSelectedTemplate}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <DocPrintingActions selectedTemplate={selectedTemplate} />
        </CardContent>
      </Card>
      
      {!projectId && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md text-sm">
          Note: For full functionality, please select a project.
        </div>
      )}
    </div>
  );
};
