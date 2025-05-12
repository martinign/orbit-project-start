
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { useLocation, useParams } from "react-router-dom";
import Projects from "./Projects";
import Contacts from "./Contacts";
import TeamMembers from "./TeamMembers";
import DashboardHome from "./DashboardHome";
import { ChatWidget } from "@/components/chat/ChatWidget";
import StickyNotesPage from "./StickyNotesPage";

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Determine which component to render based on the current path
  const renderContent = () => {
    const path = location.pathname;
    
    if (path === "/dashboard") {
      return <DashboardHome />;
    }
    
    if (path === "/contacts") {
      return <Contacts />;
    }
    
    if (path === "/team-members") {
      return <TeamMembers />;
    }
    
    if (path === "/sticky-notes") {
      return <StickyNotesPage />;
    }
    
    if (path === "/seat-booking") {
      return <SeatBookingPage />;
    }
    
    // Default to Projects for /projects and /projects/:id routes
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
      
      <ChatWidget />
    </div>
  );
};

// Placeholder for the SeatBookingPage component
const SeatBookingPage = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Seat Booking</h1>
      <p className="text-gray-600">
        This feature will allow you to book seats in the office. Coming soon.
      </p>
    </div>
  );
};

export default Dashboard;
