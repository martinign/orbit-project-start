
import { ClipboardCheck } from "lucide-react";
import { format } from "date-fns";
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SurveyButtonProps {
  canSubmitSurvey: boolean;
  loadingSurveyAvailability: boolean;
  nextAvailableDate: Date | null;
  onOpenSurvey: () => void;
}

export const SurveyButton = ({
  canSubmitSurvey,
  loadingSurveyAvailability,
  nextAvailableDate,
  onOpenSurvey
}: SurveyButtonProps) => {
  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <SidebarMenuButton 
                      tooltip="Survey" 
                      className={`hover:bg-blue-500/10 transition-colors duration-200 ${!canSubmitSurvey ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => canSubmitSurvey && onOpenSurvey()}
                      disabled={!canSubmitSurvey || loadingSurveyAvailability}
                    >
                      <ClipboardCheck className={`${canSubmitSurvey ? 'text-blue-500' : 'text-gray-400'}`} />
                      <span>SURVEY</span>
                    </SidebarMenuButton>
                  </div>
                </TooltipTrigger>
                {!canSubmitSurvey && nextAvailableDate && (
                  <TooltipContent>
                    <p>You can submit another survey after {format(nextAvailableDate, 'MMMM dd, yyyy')}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
