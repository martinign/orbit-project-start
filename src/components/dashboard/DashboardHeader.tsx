
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DashboardHeader() {
  const navigate = useNavigate();

  const handleCreateProject = () => {
    navigate("/projects");
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex gap-2 mt-2 md:mt-0">
        <Button variant="default" className="bg-blue-500 hover:bg-blue-600" onClick={handleCreateProject}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </div>
    </div>
  );
}
