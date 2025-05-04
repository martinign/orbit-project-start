
import React, { useState } from 'react';
import { DownloadIcon, FolderIcon, FolderPlusIcon, UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface RepositoryDisplayProps {
  projectId?: string;
}

type Document = {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
};

export const RepositoryDisplay: React.FC<RepositoryDisplayProps> = ({ projectId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const storageLimit = 100; // 100MB storage limit example

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Document Repository</h3>
        <div className="flex gap-2">
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
            <FolderPlusIcon className="h-4 w-4 mr-1" /> New Folder
          </Button>
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
            <UploadIcon className="h-4 w-4 mr-1" /> Upload
          </Button>
        </div>
      </div>
      
      {projectId ? (
        <p className="text-muted-foreground mb-2">Project-specific repository for project ID: {projectId}</p>
      ) : (
        <p className="text-muted-foreground mb-2">Global document repository</p>
      )}
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted-foreground">Storage used</span>
          <span className="text-xs font-medium">{storageUsed}MB / {storageLimit}MB</span>
        </div>
        <Progress value={(storageUsed / storageLimit) * 100} className="h-2" />
      </div>

      {documents.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">{doc.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Badge variant="secondary">{doc.type}</Badge>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{doc.size}KB</td>
                  <td className="px-4 py-2 whitespace-nowrap">{doc.uploadedBy}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {doc.uploadedAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right">
                    <Button variant="ghost" size="sm">
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <FolderIcon className="h-12 w-12 mx-auto text-gray-300" />
          <p className="mt-2 text-muted-foreground">No documents have been uploaded yet</p>
          <Button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
            <UploadIcon className="h-4 w-4 mr-1" /> Upload Documents
          </Button>
        </div>
      )}
    </div>
  );
};
