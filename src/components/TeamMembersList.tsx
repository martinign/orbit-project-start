
import React, { useState } from 'react';
import { Edit, Trash2, Building, MapPin, UserCog, Mail, Phone, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  CardTitle,
  CardFooter 
} from "@/components/ui/card";

interface TeamMembersListProps {
  projectId: string | null;
  searchQuery: string;
  viewMode: "table" | "card";
}

// Define a proper type for team members from Supabase
interface TeamMember {
  id: string;
  full_name: string;
  role: string | null;
  location: string | null;
  project_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  // Optional fields that might not exist in the database yet
  email?: string | null;
  phone?: string | null;
  organization?: string | null;
  projects?: {
    id: string;
    project_number: string;
    Sponsor: string;
  } | null;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({ 
  projectId, 
  searchQuery, 
  viewMode 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: teamMembers, isLoading } = useQuery({
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
      
      return data as TeamMember[];
    },
  });

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (member: TeamMember) => {
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

      // Invalidate the query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["team_members"] });

      toast({
        title: "Success",
        description: "Team member deleted successfully",
      });
      
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {teamMembers.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg truncate">{member.full_name}</CardTitle>
                {member.role && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {member.role}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2 text-sm">
                  {/* Only render email if it exists */}
                  {member.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{member.email}</span>
                    </p>
                  )}
                  
                  {/* Only render phone if it exists */}
                  {member.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {member.phone}
                    </p>
                  )}
                  
                  {/* Only render organization if it exists */}
                  {member.organization && (
                    <p className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {member.organization}
                    </p>
                  )}
                  
                  {member.location && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {member.location}
                    </p>
                  )}
                  
                  {!projectId && member.projects && (
                    <p className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full inline-block mt-1">
                      {member.projects.project_number} - {member.projects.Sponsor}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-end border-t p-2">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(member)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(member)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardFooter>
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
                // Invalidate the query to refresh the data
                queryClient.invalidateQueries({ queryKey: ["team_members"] });
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
