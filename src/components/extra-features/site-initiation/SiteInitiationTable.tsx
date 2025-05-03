
import React, { useState, useMemo } from 'react';
import { useSiteInitiationData, SiteData } from '@/hooks/useSiteInitiationData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2, Search, Download, Check, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SiteInitiationEditDialog } from './SiteInitiationEditDialog';
import { toast } from '@/hooks/use-toast';

interface SiteInitiationTableProps {
  projectId?: string;
}

export const SiteInitiationTable: React.FC<SiteInitiationTableProps> = ({ projectId }) => {
  const { sites, loading, error, deleteSite, refetch } = useSiteInitiationData(projectId);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [siteToEdit, setSiteToEdit] = useState<SiteData | null>(null);

  // Filter sites based on search query
  const filteredSites = useMemo(() => {
    if (!searchQuery.trim()) return sites;
    
    const query = searchQuery.toLowerCase();
    return sites.filter(site => 
      site.pxl_site_reference_number?.toLowerCase().includes(query) ||
      site.pi_name?.toLowerCase().includes(query) ||
      site.site_personnel_name?.toLowerCase().includes(query) ||
      site.institution?.toLowerCase().includes(query) ||
      site.role?.toLowerCase().includes(query)
    );
  }, [sites, searchQuery]);

  const handleDeleteClick = (id: string) => {
    setSiteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (siteToDelete) {
      await deleteSite(siteToDelete);
      setDeleteDialogOpen(false);
      setSiteToDelete(null);
      refetch();
    }
  };

  const handleEditClick = (site: SiteData) => {
    setSiteToEdit(site);
    setEditDialogOpen(true);
  };

  const handleExportCSV = () => {
    if (!sites.length) {
      toast({
        title: "No data to export",
        description: "There are no sites to export to CSV.",
        variant: "default"
      });
      return;
    }

    // Define CSV headers
    const headers = [
      'Country',
      'PXL Site Reference Number',
      'PI Name',
      'Site Personnel Name',
      'Role',
      'Site Personnel Email Address',
      'Site Personnel Telephone',
      'Site Personnel Fax',
      'Institution',
      'Address',
      'City/Town',
      'Province/State',
      'Zip Code',
      'Starter Pack'
    ];

    // Map sites data to CSV format
    const csvData = sites.map(site => [
      site.country || '',
      site.pxl_site_reference_number || '',
      site.pi_name || '',
      site.site_personnel_name || '',
      site.role || '',
      site.site_personnel_email_address || '',
      site.site_personnel_telephone || '',
      site.site_personnel_fax || '',
      site.institution || '',
      site.address || '',
      site.city_town || '',
      site.province_state || '',
      site.zip_code || '',
      site.starter_pack ? 'Yes' : 'No'
    ]);

    // Create CSV content
    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `site-initiation-${projectId}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `Exported ${sites.length} sites to CSV.`,
      variant: "default"
    });
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load site data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Sites</CardTitle>
            <CardDescription>Manage site initiation data</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sites..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleExportCSV} className="bg-blue-500 hover:bg-blue-600 text-white">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">Loading sites...</div>
          ) : sites.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No sites found. Upload a CSV to import site data.
            </div>
          ) : (
            <div className="max-h-[600px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site Ref.</TableHead>
                    <TableHead>Personnel</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Starter Pack</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSites.map((site) => (
                    <TableRow key={site.id}>
                      <TableCell className="font-medium">{site.pxl_site_reference_number}</TableCell>
                      <TableCell>
                        <div>
                          <div>{site.site_personnel_name}</div>
                          <div className="text-xs text-muted-foreground">PI: {site.pi_name || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{site.role}</TableCell>
                      <TableCell>{site.institution || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {site.site_personnel_email_address && (
                            <div>{site.site_personnel_email_address}</div>
                          )}
                          {site.site_personnel_telephone && (
                            <div>{site.site_personnel_telephone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {site.starter_pack ? (
                          <Badge className="flex items-center gap-1 bg-green-100 text-green-800">
                            <Check className="h-3 w-3" /> Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <X className="h-3 w-3" /> No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(site)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(site.id!)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this site record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {siteToEdit && (
        <SiteInitiationEditDialog
          site={siteToEdit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          projectId={projectId}
          onSuccess={refetch}
        />
      )}
    </>
  );
};
