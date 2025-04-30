
import React from 'react';
import { 
  Card, 
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ImportantLinks } from '@/components/extra-features/ImportantLinks';
import { SiteInitiationTracker } from '@/components/extra-features/SiteInitiationTracker';
import { Repository } from '@/components/extra-features/Repository';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ExtraFeaturesState } from '@/hooks/useExtraFeatures';

interface ExtraFeaturesSectionsProps {
  features: ExtraFeaturesState;
  projectId?: string;
  isImportantLinksOpen: boolean;
  isSiteTrackerOpen: boolean;
  isRepositoryOpen: boolean;
  setIsImportantLinksOpen: (isOpen: boolean) => void;
  setIsSiteTrackerOpen: (isOpen: boolean) => void;
  setIsRepositoryOpen: (isOpen: boolean) => void;
}

export const ExtraFeaturesSections: React.FC<ExtraFeaturesSectionsProps> = ({
  features,
  projectId,
  isImportantLinksOpen,
  isSiteTrackerOpen,
  isRepositoryOpen,
  setIsImportantLinksOpen,
  setIsSiteTrackerOpen,
  setIsRepositoryOpen
}) => {
  const hasEnabledFeatures = features.importantLinks || features.siteInitiationTracker || features.repository;

  if (!hasEnabledFeatures) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.importantLinks && (
        <Collapsible 
          open={isImportantLinksOpen}
          onOpenChange={setIsImportantLinksOpen}
          className="col-span-1"
        >
          <Card>
            <CardHeader className="border-b flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Important Links</CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isImportantLinksOpen ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-4">
                <ImportantLinks projectId={projectId} />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
      
      {features.siteInitiationTracker && (
        <Collapsible 
          open={isSiteTrackerOpen}
          onOpenChange={setIsSiteTrackerOpen}
          className="col-span-1"
        >
          <Card>
            <CardHeader className="border-b flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Site Initiation Tracker</CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isSiteTrackerOpen ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-4">
                <SiteInitiationTracker projectId={projectId} />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
      
      {features.repository && (
        <Collapsible 
          open={isRepositoryOpen}
          onOpenChange={setIsRepositoryOpen}
          className="col-span-1"
        >
          <Card>
            <CardHeader className="border-b flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Repository</CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isRepositoryOpen ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-4">
                <Repository projectId={projectId} />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
};
