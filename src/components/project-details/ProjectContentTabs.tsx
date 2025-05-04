
import React, { useRef, useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExtraFeaturesState } from '@/hooks/useExtraFeatures';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProjectContentTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
  extraFeatures?: ExtraFeaturesState;
  isProjectOwner: boolean;
}

export const ProjectContentTabs: React.FC<ProjectContentTabsProps> = ({
  activeTab,
  onTabChange,
  children,
  extraFeatures = {
    importantLinks: false,
    siteInitiationTracker: false,
    repository: false,
    docPrinting: false,
    billOfMaterials: false,
    designSheet: false,
    workdayScheduled: false
  },
  isProjectOwner
}) => {
  // Make sure extraFeatures is never undefined
  const safeExtraFeatures = extraFeatures || {
    importantLinks: false,
    siteInitiationTracker: false,
    repository: false,
    docPrinting: false,
    billOfMaterials: false,
    designSheet: false,
    workdayScheduled: false
  };

  // Refs and state for scrolling tabs
  const tabsListRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // Function to check if scrolling is possible
  const checkScrollability = () => {
    if (tabsListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5); // Small buffer for rounding errors
    }
  };
  
  // Initialize and update scroll buttons on resize or content change
  useEffect(() => {
    checkScrollability();
    const observer = new ResizeObserver(() => {
      checkScrollability();
    });
    
    if (tabsListRef.current) {
      observer.observe(tabsListRef.current);
    }
    
    window.addEventListener('resize', checkScrollability);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkScrollability);
    };
  }, [safeExtraFeatures, isProjectOwner]);

  // Scroll handlers
  const scrollLeft = () => {
    if (tabsListRef.current) {
      const scrollAmount = Math.min(tabsListRef.current.scrollLeft, 200);
      tabsListRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollability, 300);
    }
  };
  
  const scrollRight = () => {
    if (tabsListRef.current) {
      const scrollAmount = Math.min(
        tabsListRef.current.scrollWidth - tabsListRef.current.clientWidth - tabsListRef.current.scrollLeft,
        200
      );
      tabsListRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollability, 300);
    }
  };
  
  // Listen for scroll events
  useEffect(() => {
    const currentRef = tabsListRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScrollability);
      return () => {
        currentRef.removeEventListener('scroll', checkScrollability);
      };
    }
  }, []);
  
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <div className="relative flex items-center border-b border-border">
        {/* Left scroll button */}
        <Button
          onClick={scrollLeft}
          variant="ghost"
          size="icon"
          className={cn(
            "absolute left-0 z-10 transition-opacity bg-blue-500 hover:bg-blue-600 text-white rounded-full",
            !canScrollLeft ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
          aria-label="Scroll tabs left"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {/* Scrollable tabs list */}
        <div
          className="flex-1 overflow-x-scroll no-scrollbar mx-10"
          ref={tabsListRef}
        >
          <TabsList className="inline-flex w-max border-0">
            <TabsTrigger value="tasks" className="text-xs md:text-sm">Tasks</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs md:text-sm">Notes</TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs md:text-sm">Calendar</TabsTrigger>
            <TabsTrigger value="contacts" className="text-xs md:text-sm">Contacts</TabsTrigger>
            <TabsTrigger value="team" className="text-xs md:text-sm">Team</TabsTrigger>
            
            {isProjectOwner && (
              <TabsTrigger value="invites" className="text-xs md:text-sm">Invites</TabsTrigger>
            )}
            
            {safeExtraFeatures.importantLinks && (
              <TabsTrigger value="important-links" className="text-xs md:text-sm">Links</TabsTrigger>
            )}
            
            {safeExtraFeatures.siteInitiationTracker && (
              <TabsTrigger value="site-initiation" className="text-xs md:text-sm">Site Tracker</TabsTrigger>
            )}
            
            {safeExtraFeatures.repository && (
              <TabsTrigger value="repository" className="text-xs md:text-sm">Repository</TabsTrigger>
            )}
            
            {safeExtraFeatures.docPrinting && (
              <TabsTrigger value="doc-printing" className="text-xs md:text-sm">Doc Printing</TabsTrigger>
            )}
            
            {safeExtraFeatures.billOfMaterials && (
              <TabsTrigger value="bill-of-materials" className="text-xs md:text-sm">Bill of Materials</TabsTrigger>
            )}
            
            {safeExtraFeatures.designSheet && (
              <TabsTrigger value="design-sheet" className="text-xs md:text-sm">Design Sheet</TabsTrigger>
            )}
            
            {safeExtraFeatures.workdayScheduled && (
              <TabsTrigger value="workday-schedule" className="text-xs md:text-sm">Workday Schedule</TabsTrigger>
            )}
          </TabsList>
        </div>
        
        {/* Right scroll button */}
        <Button
          onClick={scrollRight}
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-0 z-10 transition-opacity bg-blue-500 hover:bg-blue-600 text-white rounded-full",
            !canScrollRight ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
          aria-label="Scroll tabs right"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {children}
    </Tabs>
  );
};
