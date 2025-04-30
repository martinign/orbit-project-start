
import React from 'react';
import { SiteInitiationTracker } from '@/components/extra-features/SiteInitiationTracker';
import { TabContentWrapper } from './TabContentWrapper';

interface SiteInitiationTrackerTabProps {
  projectId: string;
}

export const SiteInitiationTrackerTab: React.FC<SiteInitiationTrackerTabProps> = ({ projectId }) => {
  return (
    <TabContentWrapper value="site-initiation" title="Site Initiation Tracker">
      <SiteInitiationTracker projectId={projectId} />
    </TabContentWrapper>
  );
};
