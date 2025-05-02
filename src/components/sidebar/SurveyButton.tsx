
import { ClipboardCheck } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SurveyButtonProps {
  canSubmitSurvey: boolean;
  loadingSurveyAvailability: boolean;
  onSurveyClick: () => void;
}

export const SurveyButton = ({ 
  canSubmitSurvey, 
  loadingSurveyAvailability, 
  onSurveyClick 
}: SurveyButtonProps) => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <SidebarMenuButton 
                  tooltip="Survey" 
                  className={`hover:bg-blue-500/10 transition-colors duration-200 ${!canSubmitSurvey ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => canSubmitSurvey && onSurveyClick()}
                  disabled={!canSubmitSurvey || loadingSurveyAvailability}
                >
                  <ClipboardCheck className={`${canSubmitSurvey ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span>SURVEY</span>
                </SidebarMenuButton>
              </div>
            </TooltipTrigger>
            {!canSubmitSurvey && (
              <TooltipContent>
                <p>You've already submitted a survey. Thank you for your feedback!</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
