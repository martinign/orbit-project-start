
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder, FileText, Plus, Download } from 'lucide-react';

interface RepositoryTabProps {
  projectId: string;
}

export const RepositoryTab: React.FC<RepositoryTabProps> = ({ projectId }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Document Repository</CardTitle>
            <CardDescription>
              Central storage for all project documents
            </CardDescription>
          </div>
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="h-4 w-4 mr-1" /> Upload File
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="border rounded-md p-2">
            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <Folder className="text-blue-500 h-5 w-5" />
              <span className="flex-1 font-medium">Regulatory Documents</span>
              <span className="text-sm text-gray-500">4 files</span>
            </div>
          </div>
          
          <div className="border rounded-md p-2">
            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <Folder className="text-blue-500 h-5 w-5" />
              <span className="flex-1 font-medium">Study Protocol</span>
              <span className="text-sm text-gray-500">2 files</span>
            </div>
            
            <div className="ml-7 border-l pl-4 space-y-2 mt-1">
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <FileText className="text-gray-500 h-4 w-4" />
                  <span>Protocol_v1.2.pdf</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <FileText className="text-gray-500 h-4 w-4" />
                  <span>Protocol_amendments.docx</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border rounded-md p-2">
            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <Folder className="text-blue-500 h-5 w-5" />
              <span className="flex-1 font-medium">Site Documents</span>
              <span className="text-sm text-gray-500">7 files</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
