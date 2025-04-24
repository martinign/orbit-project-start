import { Folder, LogOut, List, Plus, FileText, Users, UserRound, MoreHorizontal, Circle, Eye, UserPlus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useInvitationsCount } from "@/hooks/useInvitationsCount";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuAction,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import ProjectDialog from "@/components/ProjectDialog";
import TaskTemplateDialog from "@/components/TaskTemplateDialog";
import TaskTemplatesListDialog from "@/components/TaskTemplatesListDialog";
import InviteMembersDialog from "@/components/team-members/InviteMembersDialog";
import PendingInvitationsDialog from "./team-members/PendingInvitationsDialog";

export function AppSidebar() {
    const { signOut } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isTaskTemplateDialogOpen, setIsTaskTemplateDialogOpen] = useState(false);
    const [isViewTemplatesDialogOpen, setIsViewTemplatesDialogOpen] = useState(false);
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isInviteMembersDialogOpen, setIsInviteMembersDialogOpen] = useState(false);
    const [isPendingInvitationsOpen, setIsPendingInvitationsOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const pendingInvitationsCount = useInvitationsCount();

    const {
        data: recentProjects,
        refetch: refetchRecentProjects,
        isLoading: isRecentProjectsLoading, // Optional: for loading state
        error: recentProjectsError, // Optional: for error handling
    } = useQuery({
        queryKey: ["recent_projects"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("projects")
                .select("id, project_number, protocol_number, protocol_title, Sponsor, description, status, updated_at")
                .order("updated_at", { ascending: false })
                .limit(5);
            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000, // Increased stale time to 5 minutes
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });

    // More specific invalidation based on the Supabase event
    useEffect(() => {
        const channel = supabase.channel('projects_changes').on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'projects'
        }, (payload) => {
            // Invalidate relevant queries based on the event type and payload if needed
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
                queryClient.invalidateQueries({ queryKey: ["recent_projects"] });
                queryClient.invalidateQueries({ queryKey: ["projects"] });
                // If the payload contains the project ID, you could be even more specific:
                if (payload.old?.id || payload.new?.id) {
                    const projectId = payload.old?.id || payload.new?.id;
                    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
                }
            }
        }).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    const handleEditProject = useCallback((e: React.MouseEvent, project: any) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedProject(project);
        setIsProjectDialogOpen(true);
    }, []);

    const handleDeleteProject = useCallback((e: React.MouseEvent, project: any) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedProject(project);
        setIsDeleteDialogOpen(true);
    }, []);

    const confirmDeleteProject = useCallback(async () => {
        if (!selectedProject) return;
        try {
            const { error } = await supabase
                .from("projects")
                .delete()
                .eq("id", selectedProject.id);
            if (error) {
                throw error;
            }
            // Invalidate specific queries after deletion
            queryClient.invalidateQueries({ queryKey: ["recent_projects"] });
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["project", selectedProject.id] });
            toast({
                title: "Success",
                description: "Project deleted successfully",
            });
            setIsDeleteDialogOpen(false);
        } catch (error: any) {
            console.error("Error deleting project:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to delete project",
                variant: "destructive",
            });
        }
    }, [queryClient, selectedProject, toast]);

    const handleProjectSuccess = useCallback(() => {
        refetchRecentProjects();
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        setIsProjectDialogOpen(false);
    }, [queryClient, refetchRecentProjects]);

    const getStatusColor = useCallback((status: string) => {
        switch (status) {
            case 'active':
                return "text-green-500";
            case 'pending':
                return "text-yellow-500";
            case 'completed':
                return "text-blue-500";
            case 'cancelled':
                return "text-gray-500";
            default:
                return "text-gray-400";
        }
    }, []);

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border">
                <div className="flex items-center p-2">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-300">
                        PXL Management Tool
                    </h2>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>PROJECTS</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Link to="/projects">
                                    <SidebarMenuButton
                                        tooltip="Projects"
                                        className="hover:bg-blue-500/10 transition-colors duration-200"
                                    >
                                        <Folder className="text-blue-500" />
                                        <span>Projects</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>PROJECT INVITATIONS</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Link to="/contacts"></Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link to="/team-members"></Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip="Invite Members"
                                    className="hover:bg-purple-500/10 transition-colors duration-200 relative"
                                    onClick={() => setIsInviteMembersDialogOpen(true)}
                                >
                                    <UserPlus className="text-purple-500" />
                                    <span>Invite Members</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            {pendingInvitationsCount > 0 && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="Pending Invitations"
                                        className="hover:bg-purple-500/10 transition-colors duration-200"
                                        onClick={() => setIsPendingInvitationsOpen(true)}
                                    >
                                        <Bell className="text-purple-500" />
                                        <span>Invitations</span>
                                        <Badge variant="secondary" className="ml-auto bg-purple-100 text-purple-600 hover:bg-purple-100">
                                            {pendingInvitationsCount}
                                        </Badge>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>TASK MANAGEMENT</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip="Task Templates"
                                    className="hover:bg-green-500/10 transition-colors duration-200"
                                    onClick={() => setIsTaskTemplateDialogOpen(true)}
                                >
                                    <FileText className="text-green-500" />
                                    <span>Task Templates</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip="View Templates"
                                    className="hover:bg-green-500/10 transition-colors duration-200"
                                    onClick={() => setIsViewTemplatesDialogOpen(true)}
                                >
                                    <Eye className="text-green-500" />
                                    <span>View Templates</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>RECENT PROJECTS</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {recentProjects && recentProjects.length > 0 ? (
                                recentProjects.map((project) => (
                                    <SidebarMenuItem key={project.id}>
                                        <Link
                                            to={`/projects/${project.id}`}
                                            onClick={(e) => {
                                                if (
                                                    (e.target as HTMLElement).closest('[data-dropdown]') ||
                                                    (e.target as HTMLElement).closest('[data-action]')
                                                ) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        >
                                            <SidebarMenuButton
                                                tooltip={`${project.project_number} - ${project.Sponsor}`}
                                                className="hover:bg-blue-500/10 transition-colors duration-200"
                                            >
                                                <Circle className={`h-3 w-3 ${getStatusColor(project.status)}`} />
                                                <span className="truncate max-w-[150px]">
                                                    {project.project_number} - {project.Sponsor}
                                                </span>
                                            </SidebarMenuButton>
                                        </Link>
                                        <SidebarMenuAction showOnHover>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild data-dropdown="true">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 p-0"
                                                        data-action="true"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-3 w-3" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={(e) => handleEditProject(e, project)}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => handleDeleteProject(e, project)}>
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </SidebarMenuAction>
                                    </SidebarMenuItem>
                                ))
                            ) : (
                                <SidebarMenuItem>
                                    <SidebarMenuButton className="text-gray-400 cursor-default">
                                        <span>No recent projects</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 mt-2"
                    onClick={signOut}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </SidebarFooter>

            <TaskTemplateDialog
                open={isTaskTemplateDialogOpen}
                onClose={() => setIsTaskTemplateDialogOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["task_templates"] });
                    setIsTaskTemplateDialogOpen(false);
                }}
            />

            <TaskTemplatesListDialog
                open={isViewTemplatesDialogOpen}
                onClose={() => setIsViewTemplatesDialogOpen(false)}
            />

            <ProjectDialog
                open={isProjectDialogOpen}
                onClose={() => setIsProjectDialogOpen(false)}
                onSuccess={handleProjectSuccess}
                project={selectedProject}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the project "
                            {selectedProject?.project_number} - {selectedProject?.Sponsor}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteProject} className="bg-red-500 hover:bg-red-600">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <InviteMembersDialog
                open={isInviteMembersDialogOpen}
                onClose={() => setIsInviteMembersDialogOpen(false)}
            />

            <PendingInvitationsDialog
                open={isPendingInvitationsOpen}
                onClose={() => setIsPendingInvitationsOpen(false)}
            />
        </Sidebar>
    );
}