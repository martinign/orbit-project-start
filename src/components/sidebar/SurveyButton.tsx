
import { ClipboardCheck } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuBadge } from "@/components/ui/sidebar";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNewSurveyResponses } from "@/hooks/useNewSurveyResponses";

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
  const { hasNewResponses, clearNewResponsesIndicator } = useNewSurveyResponses();

  const handleClick = () => {
    if (canSubmitSurvey) {
      // Clear the badge when clicking on the survey button
      clearNewResponsesIndicator();
      onSurveyClick();
    }
  };

  console.log('SurveyButton rendering, hasNewResponses:', hasNewResponses);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <SidebarMenuButton 
                  tooltip="Survey" 
                  className={`hover:bg-blue-500/10 transition-colors duration-200 ${!canSubmitSurvey ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleClick}
                  disabled={!canSubmitSurvey || loadingSurveyAvailability}
                >
                  <ClipboardCheck className={`${canSubmitSurvey ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span>SURVEY</span>
                </SidebarMenuButton>

                {/* New responses badge - display as a dot without using asChild on Badge */}
                {hasNewResponses && (
                  <div 
                    className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full"
                    aria-label="New survey responses"
                  />
                )}
              </div>
            </TooltipTrigger>
            {!canSubmitSurvey && (
              <TooltipContent>
                <p>You've already submitted a survey. Thank you for your feedback!</p>
              </TooltipContent>
            )}
            {hasNewResponses && (
              <TooltipContent>
                <p>New survey responses available!</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
