
export interface ExtraFeaturesState {
  importantLinks: boolean;
  siteInitiationTracker: boolean;
  docPrinting: boolean;
  billOfMaterials: boolean;
  designSheet: boolean;
  workdayScheduled: boolean;
  vacationTracker: boolean;
}

export const defaultFeatures: ExtraFeaturesState = {
  importantLinks: false,
  siteInitiationTracker: false,
  docPrinting: false,
  billOfMaterials: false,
  designSheet: false,
  workdayScheduled: false,
  vacationTracker: false,
};

export interface FeatureUpdateEvent extends CustomEvent {
  detail: {
    projectId: string;
    features: ExtraFeaturesState;
  };
}
