
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePagination } from "@/hooks/usePagination";

export const useProjects = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [activeTab, setActiveTab] = useState<"all" | "billable" | "non-billable">("all");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  
  // Initialize pagination
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 10
  });
  
  // Get query with pagination
  const {
    data: projectsData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["projects", pagination.currentPage, pagination.pageSize],
    queryFn: async () => {
      // First, get the total count for pagination
      const countQuery = supabase
        .from("projects")
        .select("id", { count: "exact", head: true });
      
      const { count: totalCount, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      // Update total items in pagination
      if (totalCount !== null) {
        pagination.setTotalItems(totalCount);
      }
      
      // Now fetch the paginated data
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .range(pagination.offset, pagination.offset + pagination.pageSize - 1)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return { data, totalCount };
    }
  });

  // Filter projects based on search query, tab selection, and status filter
  useEffect(() => {
    if (projectsData?.data && projectsData.data.length > 0) {
      let filtered = projectsData.data;

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
  }, [searchQuery, projectsData, activeTab, statusFilter]);

  // Reset to first page when changing filters
  useEffect(() => {
    pagination.goToPage(1);
  }, [activeTab, statusFilter, searchQuery]);

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
    projects: projectsData?.data || [],
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
    refetch,
    // Add pagination properties
    pagination
  };
};
