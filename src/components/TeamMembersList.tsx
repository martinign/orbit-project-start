
import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TeamMembersListProps {
  projectId: string;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({ projectId }) => {
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    role: '',
    location: '',
  });

  const { data: teamMembers, isLoading, refetch } = useQuery({
    queryKey: ["team_members", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_team_members")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
  });

  const handleEdit = (member: any) => {
    setSelectedMember(member);
    setFormData({
      full_name: member.full_name,
      role: member.role || '',
      location: member.location || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (member: any) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedMember(null);
    setFormData({
      full_name: '',
      role: '',
      location: '',
    });
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (!formData.full_name.trim()) {
        toast({
          title: "Error",
          description: "Team member name is required.",
          variant: "destructive",
        });
        return;
      }

      if (selectedMember) {
        // Update existing team member
        const { error } = await supabase
          .from("project_team_members")
          .update({
            full_name: formData.full_name,
            role: formData.role || null,
            location: formData.location || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedMember.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Team member updated successfully.",
        });
      } else {
        // Add new team member
        const { error } = await supabase
          .from("project_team_members")
          .insert({
            project_id: projectId,
            full_name: formData.full_name,
            role: formData.role || null,
            location: formData.location || null,
            user_id: (await supabase.auth.getUser()).data.user?.id,
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Team member added successfully.",
        });
      }
      
      setIsEditDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error saving team member:", error);
      toast({
        title: "Error",
        description: "Failed to save team member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;
    
    try {
      const { error } = await supabase
        .from("project_team_members")
        .delete()
        .eq("id", selectedMember.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete the team member. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Team member deleted successfully.",
      });
      refetch();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-6">Loading team members...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Project Team Members</h2>
        <Button
          onClick={handleAddNew}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Add Team Member
        </Button>
      </div>

      {teamMembers && teamMembers.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.full_name}</TableCell>
                <TableCell>{member.role || '-'}</TableCell>
                <TableCell>{member.location || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(member)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-md">
          No team members found for this project. Click "Add Team Member" to add your first team member.
        </div>
      )}

      {/* Edit/Add Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedMember ? "Edit Team Member" : "Add Team Member"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="full_name">Name *</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Enter team member's name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                placeholder="Enter role (e.g. Project Manager)"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter location"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {selectedMember ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the team member "{selectedMember?.full_name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamMembersList;
