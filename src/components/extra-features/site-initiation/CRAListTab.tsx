
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Mail, Plus, Trash2, Edit } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { usePagination } from '@/hooks/usePagination';

interface CRAListTabProps {
  projectId?: string;
}

interface CRAEntry {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  study_site: string | null;
  status: string | null;
  email: string | null;
  study_country: string | null;
  study_team_role: string | null;
  user_type: string | null;
  user_reference: string | null;
}

export const CRAListTab: React.FC<CRAListTabProps> = ({ projectId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 10;
  const { currentPage, totalPages, goToPage } = usePagination({ pageSize, totalCount: 0 });

  // Fetch CRA list data
  const { data: craEntries, isLoading, error } = useQuery({
    queryKey: ['cra_list', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('project_cra_list')
        .select('*')
        .eq('project_id', projectId);
        
      if (error) throw error;
      return data as CRAEntry[];
    },
    enabled: !!projectId,
  });

  // Fetch admin access for permission checks
  const { data: hasAdminAccess } = useQuery({
    queryKey: ['admin_access', projectId],
    queryFn: async () => {
      if (!projectId) return false;
      
      const { data, error } = await supabase.rpc('has_project_admin_access', {
        project_id: projectId
      });
      
      if (error) {
        console.error('Error checking admin access:', error);
        return false;
      }
      
      return data as boolean;
    },
    enabled: !!projectId,
  });

  // Filter CRA entries based on search query
  const filteredEntries = craEntries?.filter(entry => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      entry.full_name.toLowerCase().includes(searchLower) ||
      (entry.study_site && entry.study_site.toLowerCase().includes(searchLower)) ||
      (entry.study_country && entry.study_country.toLowerCase().includes(searchLower)) ||
      (entry.study_team_role && entry.study_team_role.toLowerCase().includes(searchLower)) ||
      (entry.email && entry.email.toLowerCase().includes(searchLower))
    );
  }) || [];

  // Calculate pagination
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="bg-red-50 p-4 rounded-md text-red-800">
            <p>Error loading CRA list: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <CardTitle>Clinical Research Associates (CRAs)</CardTitle>
            <CardDescription>Manage CRAs for this project. Import via CSV file from the Import tab.</CardDescription>
          </div>
          {hasAdminAccess && (
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add CRA
            </Button>
          )}
        </div>
        
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search CRAs..."
            className="pl-8 w-full md:w-1/3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : paginatedEntries.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    {hasAdminAccess && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry.full_name}
                        {entry.user_reference && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({entry.user_reference})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{entry.study_team_role || '-'}</TableCell>
                      <TableCell>{entry.study_site || '-'}</TableCell>
                      <TableCell>{entry.study_country || '-'}</TableCell>
                      <TableCell>
                        {entry.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{entry.email}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          entry.status === 'active' ? 'bg-green-100 text-green-800' : 
                          entry.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.status || 'Unknown'}
                        </span>
                      </TableCell>
                      {hasAdminAccess && (
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredEntries.length > pageSize && (
              <div className="flex justify-center mt-4">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredEntries.length / pageSize)}
                  onPageChange={goToPage}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No CRA entries found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Import CRA data using the CSV Import tab or add CRAs manually.
            </p>
            {hasAdminAccess && (
              <Button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="mr-2 h-4 w-4" /> Add your first CRA
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
