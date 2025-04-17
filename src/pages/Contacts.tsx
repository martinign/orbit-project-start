
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, LayoutGrid, LayoutList, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ContactsList from "@/components/ContactsList";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ContactForm from "@/components/ContactForm";

interface Project {
  id: string;
  project_number: string;
  Sponsor: string;
}

const Contacts = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [isCreateContactOpen, setIsCreateContactOpen] = useState(false);

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, project_number, Sponsor")
        .order("project_number", { ascending: true });
      
      if (error) throw error;
      return data as Project[];
    },
  });

  const handleClearFilter = () => {
    setSelectedProjectId(null);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <div className="flex flex-wrap gap-3">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("table")}
              title="Table view"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "card" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("card")}
              title="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => setIsCreateContactOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Contact
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contacts</CardTitle>
          <CardDescription>
            Manage your contacts and network connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <Select value={selectedProjectId || ""} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProjects ? (
                    <SelectItem value="loading" disabled>Loading projects...</SelectItem>
                  ) : projects && projects.length > 0 ? (
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.project_number} - {project.Sponsor}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No projects found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {selectedProjectId && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearFilter}
                className="w-full sm:w-auto"
              >
                Clear Filter
              </Button>
            )}
          </div>
          
          <ContactsList projectId={selectedProjectId} searchQuery={searchQuery} viewMode={viewMode} />
        </CardContent>
      </Card>

      {/* Create Contact Dialog */}
      <Dialog open={isCreateContactOpen} onOpenChange={setIsCreateContactOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Contact</DialogTitle>
            <DialogDescription>
              Add a new contact to your network
            </DialogDescription>
          </DialogHeader>
          <ContactForm 
            projectId={selectedProjectId} 
            onSuccess={() => {
              setIsCreateContactOpen(false);
              toast({
                title: "Success",
                description: "Contact created successfully",
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contacts;
