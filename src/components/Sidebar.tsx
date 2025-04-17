
import { Folder, LogOut, List, Plus, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import TaskDialog from "@/components/TaskDialog";
import TasksList from "@/components/TasksList";

export function AppSidebar() {
  const { signOut } = useAuth();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isViewTasksOpen, setIsViewTasksOpen] = useState(false);

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
          <SidebarGroupLabel>CONTACTS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link to="/contacts">
                  <SidebarMenuButton
                    tooltip="Contacts"
                    className="hover:bg-purple-500/10 transition-colors duration-200"
                  >
                    <Users className="text-purple-500" />
                    <span>Contacts</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>TASK MANAGEMENT</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Task Template"
                  className="hover:bg-green-500/10 transition-colors duration-200"
                  onClick={() => setIsCreateTaskOpen(true)}
                >
                  <Plus className="text-green-500" />
                  <span>Task Template</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="View Templates"
                  className="hover:bg-blue-500/10 transition-colors duration-200"
                  onClick={() => setIsViewTasksOpen(true)}
                >
                  <List className="text-blue-500" />
                  <span>View Templates</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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

      {/* Create Task Template Dialog */}
      <TaskDialog 
        open={isCreateTaskOpen} 
        onClose={() => setIsCreateTaskOpen(false)} 
      />

      {/* View Templates Dialog */}
      <Dialog open={isViewTasksOpen} onOpenChange={setIsViewTasksOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Templates</DialogTitle>
            <DialogDescription>
              View and manage your task templates
            </DialogDescription>
          </DialogHeader>
          <TasksList />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewTasksOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
