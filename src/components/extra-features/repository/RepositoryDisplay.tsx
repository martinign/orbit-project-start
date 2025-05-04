
import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { FilesList } from './FilesList';
import { useRepositoryFiles } from '@/hooks/useRepositoryFiles';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RepositoryDisplayProps {
  projectId?: string;
}

export const RepositoryDisplay: React.FC<RepositoryDisplayProps> = ({ projectId }) => {
  const { files, isLoading, refetch } = useRepositoryFiles(projectId);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'documents' | 'other'>('all');

  // Filter files based on search query and selected tab
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case 'images':
        return file.file_type?.startsWith('image/');
      case 'documents':
        return (
          file.file_type?.startsWith('application/pdf') ||
          file.file_type?.startsWith('application/msword') ||
          file.file_type?.startsWith('application/vnd.openxmlformats-officedocument') ||
          file.file_type?.startsWith('text/')
        );
      case 'other':
        return !(
          file.file_type?.startsWith('image/') ||
          file.file_type?.startsWith('application/pdf') ||
          file.file_type?.startsWith('application/msword') ||
          file.file_type?.startsWith('application/vnd.openxmlformats-officedocument') ||
          file.file_type?.startsWith('text/')
        );
      default:
        return true;
    }
  });

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please sign in to access the repository</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Repository</CardTitle>
        <CardDescription>
          {projectId 
            ? "Upload and manage files for this project" 
            : "Global document repository for all projects"
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* File Upload Component */}
        <FileUpload projectId={projectId || user.id} onUploadComplete={refetch} />
        
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Files List */}
        <FilesList 
          files={filteredFiles} 
          isLoading={isLoading} 
          onDelete={refetch} 
        />
      </CardContent>
    </Card>
  );
};
