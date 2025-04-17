
import React, { useState } from 'react';
import { Edit, Trash2, Building, MapPin, UserCog } from 'lucide-react';
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
import TeamMemberForm from "./TeamMemberForm";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

interface TeamMembersListProps {
  projectId: string | null;
  searchQuery: string;
  viewMode: "table" | "card";
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({ 
  projectId, 
  searchQuery, 
  viewMode 
}) => {
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: teamMembers, isLoading, refetch } = useQuery({
    queryKey: ["team_members", projectId, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("project_team_members")
        .select(`
          *,
          projects:project_id(
            id,
            project_number,
            Sponsor
          )
        `)
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      if (searchQuery) {
        query = query.ilike("full_name", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    },
  });

  const handleEdit = (member: any) => {
    setSelectedMember(member);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (member: any) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;
    
    try {
      const { error } = await supabase
        .from("project_team_members")
        .delete()
        .eq("id", selectedMember.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Team member deleted successfully",
      });
      
      refetch();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting team member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete team member",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-6">Loading team members...</div>;
  }

  if (!teamMembers || teamMembers.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground bg-gray-50 rounded-md">
        <UserCog className="mx-auto h-12 w-12 opacity-20 mb-2" />
        <h3 className="text-lg font-medium">No team members found</h3>
        <p className="mb-4">
          {projectId 
            ? "This project doesn't have any team members yet." 
            : "No team members added to any projects yet."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {viewMode === "table" ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Location</TableHead>
              {!projectId && <TableHead>Project</TableHead>}
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.full_name}</TableCell>
                <TableCell>{member.role || '-'}</TableCell>
                <TableCell>{member.location || '-'}</TableCell>
                {!projectId && (
                  <TableCell>
                    {member.projects?.project_number} - {member.projects?.Sponsor}
                  </TableCell>
                )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <CardHeader className="pb-2 bg-purple-50">
                <CardTitle className="text-lg">{member.full_name}</CardTitle>
                {member.role && (
                  <CardDescription className="flex items-center gap-1">
                    <UserCog className="h-3.5 w-3.5" />
                    {member.role}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {member.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{member.location}</span>
                    </div>
                  )}
                  {!projectId && member.projects && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="h-4 w-4" />
                      <span>{member.projects.project_number} - {member.projects.Sponsor}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEdit(member)}
                    className="text-purple-500 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(member)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <TeamMemberForm
              projectId={selectedMember.project_id}
              teamMember={selectedMember}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                refetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the team member 
              "{selectedMember?.full_name}" from the project.
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
