
import React, { useEffect, useState } from 'react';
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
import { DocPrinting } from '@/components/extra-features/DocPrinting';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ExtraFeaturesState } from '@/hooks/useExtraFeatures';

interface ExtraFeaturesSectionsProps {
  features: ExtraFeaturesState;
  projectId?: string;
  isImportantLinksOpen: boolean;
  isSiteTrackerOpen: boolean;
  isDocPrintingOpen: boolean;
  setIsImportantLinksOpen: (isOpen: boolean) => void;
  setIsSiteTrackerOpen: (isOpen: boolean) => void;
  setIsDocPrintingOpen: (isOpen: boolean) => void;
}

export const ExtraFeaturesSections: React.FC<ExtraFeaturesSectionsProps> = ({
  features,
  projectId,
  isImportantLinksOpen,
  isSiteTrackerOpen,
  isDocPrintingOpen,
  setIsImportantLinksOpen,
  setIsSiteTrackerOpen,
  setIsDocPrintingOpen
}) => {
  // Use state to track features so we can update immediately
  const [localFeatures, setLocalFeatures] = useState(features);
  
  // Update local state when props change
  useEffect(() => {
    setLocalFeatures(features);
  }, [features]);

  // Listen for storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'extraFeatures' && e.newValue) {
        setLocalFeatures(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const hasEnabledFeatures = localFeatures.importantLinks || localFeatures.siteInitiationTracker || 
                            localFeatures.docPrinting;

  if (!hasEnabledFeatures) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {localFeatures.importantLinks && (
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
      
      {localFeatures.siteInitiationTracker && (
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
      
      {localFeatures.docPrinting && (
        <Collapsible 
          open={isDocPrintingOpen}
          onOpenChange={setIsDocPrintingOpen}
          className="col-span-1"
        >
          <Card>
            <CardHeader className="border-b flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Doc Printing</CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isDocPrintingOpen ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-4">
                <DocPrinting projectId={projectId} />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
};
