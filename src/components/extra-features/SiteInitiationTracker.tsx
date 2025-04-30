
import React from 'react';
import { SiteInitiationDisplay } from './site-initiation/SiteInitiationDisplay';

interface SiteInitiationTrackerProps {
  projectId?: string;
}

export const SiteInitiationTracker: React.FC<SiteInitiationTrackerProps> = ({ projectId }) => {
  return <SiteInitiationDisplay projectId={projectId} />;
};
