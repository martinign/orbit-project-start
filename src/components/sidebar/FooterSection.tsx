
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarFooter } from "@/components/ui/sidebar";

interface FooterSectionProps {
  onSignOut: () => void;
}

export const FooterSection = ({ onSignOut }: FooterSectionProps) => {
  return (
    <SidebarFooter className="border-t border-sidebar-border text-align: justify">
      <Button 
        variant="ghost" 
        className="w-full justify-start text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 mt-2" 
        onClick={onSignOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </SidebarFooter>
  );
};
