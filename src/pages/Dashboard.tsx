
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { useLocation, useParams } from "react-router-dom";
import Projects from "./Projects";
import Contacts from "./Contacts";
import TeamMembers from "./TeamMembers";
import ProjectDetailsView from "@/components/ProjectDetailsView";
import DashboardHome from "./DashboardHome";
import { ChatWidget } from "@/components/chat/ChatWidget";

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  // Determine which component to render based on the current path
  const renderContent = () => {
    const path = location.pathname;
    
    if (path === "/dashboard") {
      return <DashboardHome />;
    }
    
    if (path.startsWith("/projects/") && id) {
      return <ProjectDetailsView />;
    }
    
    if (path === "/contacts") {
      return <Contacts />;
    }
    
    if (path === "/team-members") {
      return <TeamMembers />;
    }
    
    // Default to Projects for /projects route
    return <Projects />;
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1 p-4 md:p-6">
            {renderContent()}
          </main>
        </div>
      </SidebarProvider>
      
      {/* Add the ChatWidget component */}
      <ChatWidget />
    </div>
  );
};

export default Dashboard;
