
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Plus } from 'lucide-react';

interface ImportantLinksTabProps {
  projectId: string;
}

export const ImportantLinksTab: React.FC<ImportantLinksTabProps> = ({ projectId }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Important Links</CardTitle>
            <CardDescription>
              Quick access to important project resources
            </CardDescription>
          </div>
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="h-4 w-4 mr-1" /> Add Link
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50">
            <div>
              <h3 className="font-medium">Regulatory Documents</h3>
              <p className="text-sm text-gray-500">https://example.com/regulatory</p>
            </div>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50">
            <div>
              <h3 className="font-medium">Protocol Document</h3>
              <p className="text-sm text-gray-500">https://example.com/protocol</p>
            </div>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50">
            <div>
              <h3 className="font-medium">Study Dashboard</h3>
              <p className="text-sm text-gray-500">https://example.com/dashboard</p>
            </div>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
