
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Trash2, Edit, Mail, Phone } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CRAListTabProps {
  projectId: string;
}

interface CRAEntry {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  study_site: string | null;
  status: string | null;
  end_date: string | null;
  email: string | null;
  created_date: string;
  study_country: string | null;
  study_team_role: string | null;
  user_reference: string | null;
  user_type: string | null;
}

export const CRAListTab: React.FC<CRAListTabProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch CRA list data
  const { data: craEntries, isLoading, error } = useQuery({
    queryKey: ['cra_list', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_cra_list')
        .select('*')
        .eq('project_id', projectId);
        
      if (error) throw error;
      return data as CRAEntry[];
    },
  });

  // Check if the user has admin access
  const { data: hasAdminAccess } = useQuery({
    queryKey: ['admin_access', projectId],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase.rpc('has_project_admin_access', {
        project_id: projectId
      });
      
      if (error) {
        console.error('Error checking admin access:', error);
        return false;
      }
      
      return data as boolean;
    },
    enabled: !!user && !!projectId,
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
  });

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
        <div className="flex justify-between items-center">
          <CardTitle>Clinical Research Associates (CRAs)</CardTitle>
          {hasAdminAccess && (
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add CRA
            </Button>
          )}
        </div>
        <CardDescription>Manage Clinical Research Associates for this project</CardDescription>
        
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
        ) : filteredEntries && filteredEntries.length > 0 ? (
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
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.full_name}</TableCell>
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
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No CRA entries found.</p>
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
