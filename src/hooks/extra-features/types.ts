
export interface ExtraFeaturesState {
  importantLinks: boolean;
  siteInitiationTracker: boolean;
  docPrinting: boolean;
  workdayScheduled: boolean;
  vacationTracker: boolean;
}

export const defaultFeatures: ExtraFeaturesState = {
  importantLinks: false,
  siteInitiationTracker: false,
  docPrinting: false,
  workdayScheduled: false,
  vacationTracker: false,
};

export interface FeatureUpdateEvent extends CustomEvent {
  detail: {
    projectId: string;
    features: ExtraFeaturesState;
  };
}
