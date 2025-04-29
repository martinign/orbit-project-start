
import { Button } from "@/components/ui/button";
import { PlusCircle, LayoutGrid, LayoutList, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProjectsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: "table" | "card";
  setViewMode: (mode: "table" | "card") => void;
  openProjectDialog: () => void;
}

const ProjectsHeader = ({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  openProjectDialog
}: ProjectsHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 className="text-2xl font-bold">Projects</h1>
      <div className="flex flex-wrap gap-3">
        <div className="relative w-64">
          <Input 
            type="text" 
            placeholder="Search projects..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
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
          className="bg-blue-500 hover:bg-blue-600 text-white" 
          onClick={openProjectDialog}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </div>
    </div>
  );
};

export default ProjectsHeader;
