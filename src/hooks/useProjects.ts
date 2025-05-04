
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProjects = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [activeTab, setActiveTab] = useState<"all" | "billable" | "non-billable">("all");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  
  const {
    data: projects,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Filter projects based on search query, tab selection, and status filter
  useEffect(() => {
    if (projects && projects.length > 0) {
      let filtered = projects;

      // Filter by tab selection
      if (activeTab !== "all") {
        filtered = filtered.filter(project => project.project_type === activeTab);
      }

      // Filter by status if specified
      if (statusFilter) {
        filtered = filtered.filter(project => project.status === statusFilter);
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(project => 
          project.project_number.toLowerCase().includes(query) || 
          (project.protocol_number && project.protocol_number.toLowerCase().includes(query)) || 
          (project.protocol_title && project.protocol_title.toLowerCase().includes(query)) || 
          (project.Sponsor && project.Sponsor.toLowerCase().includes(query)) || 
          project.status.toLowerCase().includes(query)
        );
      }
      
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
  }, [searchQuery, projects, activeTab, statusFilter]);

  // Reset status filter when changing tabs
  useEffect(() => {
    setStatusFilter("");
  }, [activeTab]);

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete the project. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Project deleted successfully."
      });
      
      refetch();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    projects,
    filteredProjects,
    isLoading,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    activeTab,
    setActiveTab,
    statusFilter,
    setStatusFilter,
    handleDeleteProject,
    refetch
  };
};
