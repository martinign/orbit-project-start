
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutGrid, 
  LayoutList, 
  Plus, 
  Search 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import ContactsList from "@/components/ContactsList";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import ContactForm from "@/components/ContactForm";
import { useToast } from "@/hooks/use-toast";

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
      return data || [];
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search contacts..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("table")}
              title="Table view"
              className={viewMode === "table" ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "card" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("card")}
              title="Card view"
              className={viewMode === "card" ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          <Button 
            onClick={() => setIsCreateContactOpen(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="h-4 w-4" />
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
          <div className="flex justify-between items-center mb-4">
            <Select 
              value={selectedProjectId || ""} 
              onValueChange={(value) => setSelectedProjectId(value || null)}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Projects</SelectItem>
                {isLoadingProjects ? (
                  <SelectItem value="loading" disabled>
                    Loading projects...
                  </SelectItem>
                ) : projects && projects.length > 0 ? (
                  projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.project_number} - {project.Sponsor}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No projects found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            
            {selectedProjectId && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedProjectId(null)}
                className="border-blue-500 text-blue-500 hover:bg-blue-50"
              >
                Clear Filter
              </Button>
            )}
          </div>

          <ContactsList 
            projectId={selectedProjectId} 
            searchQuery={searchQuery} 
            viewMode={viewMode} 
          />
        </CardContent>
      </Card>

      <Dialog open={isCreateContactOpen} onOpenChange={setIsCreateContactOpen}>
        <DialogContent className="sm:max-w-lg">
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
                title: "Contact Created",
                description: "Your contact has been successfully added.",
              });
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contacts;
