
import React, { useState, useEffect } from 'react';
import { CalendarIcon, Plus, Trash2, FileEdit } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface VacationRecord {
  id: string;
  full_name: string;
  last_name: string;
  start_date: string;
  end_date: string;
  reason?: string;
  user_id: string;
}

interface VacationTrackerTabProps {
  projectId: string;
}

export const VacationTrackerTab: React.FC<VacationTrackerTabProps> = ({ projectId }) => {
  const [vacations, setVacations] = useState<VacationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentVacation, setCurrentVacation] = useState<VacationRecord | null>(null);
  const { user } = useAuth();
  
  // Form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  
  useEffect(() => {
    fetchVacations();
  }, [projectId]);
  
  const fetchVacations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_team_vacations')
        .select('*')
        .eq('project_id', projectId)
        .order('start_date', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      setVacations(data || []);
    } catch (error) {
      console.error('Error fetching vacations:', error);
      toast({
        title: "Error",
        description: "Failed to load vacation records",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenDialog = (vacation?: VacationRecord) => {
    if (vacation) {
      // Edit mode
      setIsEditMode(true);
      setCurrentVacation(vacation);
      setStartDate(vacation.start_date);
      setEndDate(vacation.end_date);
      setReason(vacation.reason || '');
    } else {
      // Add mode
      setIsEditMode(false);
      setCurrentVacation(null);
      setStartDate('');
      setEndDate('');
      setReason('');
    }
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isEditMode && currentVacation) {
        // Update existing vacation
        const { error } = await supabase
          .from('project_team_vacations')
          .update({
            start_date: startDate,
            end_date: endDate,
            reason,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentVacation.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Vacation record updated successfully"
        });
      } else {
        // Create new vacation
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, last_name')
          .eq('id', user.id)
          .single();
          
        const { error } = await supabase
          .from('project_team_vacations')
          .insert({
            project_id: projectId,
            user_id: user.id,
            full_name: profileData?.full_name || 'Unknown',
            last_name: profileData?.last_name || '',
            start_date: startDate,
            end_date: endDate,
            reason
          });
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Vacation record added successfully"
        });
      }
      
      // Refresh the data and close dialog
      fetchVacations();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving vacation:', error);
      toast({
        title: "Error",
        description: "Failed to save vacation record",
        variant: "destructive"
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this vacation record?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('project_team_vacations')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Vacation record deleted successfully"
      });
      
      fetchVacations();
    } catch (error) {
      console.error('Error deleting vacation:', error);
      toast({
        title: "Error",
        description: "Failed to delete vacation record",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Vacation Tracker</h2>
        <Button 
          onClick={() => handleOpenDialog()} 
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Vacation
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">Loading vacation records...</div>
      ) : vacations.length === 0 ? (
        <Card className="p-8 text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">No Vacation Records</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add vacation records for team members to help with project planning.
          </p>
          <Button 
            onClick={() => handleOpenDialog()} 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Your First Vacation
          </Button>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vacations.map((vacation) => {
                const startDate = new Date(vacation.start_date);
                const endDate = new Date(vacation.end_date);
                const durationDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                
                return (
                  <TableRow key={vacation.id}>
                    <TableCell>{vacation.full_name}</TableCell>
                    <TableCell>{format(new Date(vacation.start_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(new Date(vacation.end_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{durationDays} day{durationDays !== 1 ? 's' : ''}</TableCell>
                    <TableCell className="max-w-xs truncate">{vacation.reason || '—'}</TableCell>
                    <TableCell className="text-right">
                      {user?.id === vacation.user_id && (
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleOpenDialog(vacation)}
                          >
                            <FileEdit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(vacation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Vacation' : 'Add Vacation'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  min={startDate}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Vacation reason (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                {isEditMode ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
