
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, FileDown, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DocPrintingProps {
  projectId?: string;
}

export const DocPrinting: React.FC<DocPrintingProps> = ({ projectId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
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

  const handlePrint = () => {
    if (!selectedTemplate) {
      toast({
        title: "No template selected",
        description: "Please select a document template to print",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would generate and print the document
    // For now, we'll just show a success message
    toast({
      title: "Document sent to printer",
      description: "Your document has been sent to the default printer",
    });
  };

  const handleDownload = () => {
    if (!selectedTemplate) {
      toast({
        title: "No template selected",
        description: "Please select a document template to download",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would generate and download the document
    // For now, we'll just show a success message
    toast({
      title: "Document ready for download",
      description: "Your document will download shortly",
    });
  };

  const handlePreview = () => {
    if (!selectedTemplate) {
      toast({
        title: "No template selected",
        description: "Please select a document template to preview",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would generate a preview of the document
    // For now, we'll just show a success message
    toast({
      title: "Document preview",
      description: "Preview functionality coming soon",
    });
  };

  // Get current templates based on active tab
  const getCurrentTemplates = () => {
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
                <div>
                  <Label htmlFor="template-select">Select Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger id="template-select" className="w-full">
                      <SelectValue placeholder="Select a document template" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectDocTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="study-docs" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-select">Select Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger id="template-select" className="w-full">
                      <SelectValue placeholder="Select a document template" />
                    </SelectTrigger>
                    <SelectContent>
                      {studyDocTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="admin-docs" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-select">Select Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger id="template-select" className="w-full">
                      <SelectValue placeholder="Select a document template" />
                    </SelectTrigger>
                    <SelectContent>
                      {adminDocTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex flex-wrap gap-2 mt-6">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print Document
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={handlePreview} variant="secondary" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Preview
            </Button>
          </div>
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
