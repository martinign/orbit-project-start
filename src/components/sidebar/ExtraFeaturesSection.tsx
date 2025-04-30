
import { Sliders } from "lucide-react";
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem 
} from "@/components/ui/sidebar";

interface ExtraFeaturesSectionProps {
  onExtraFeaturesClick: (e: React.MouseEvent) => void;
}

export const ExtraFeaturesSection = ({
  onExtraFeaturesClick
}: ExtraFeaturesSectionProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>EXTRA FEATURES</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Extra Features" 
              className="hover:bg-indigo-500/10 transition-colors duration-200"
              onClick={onExtraFeaturesClick}
            >
              <Sliders className="text-indigo-500" />
              <span>Extra Features</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
