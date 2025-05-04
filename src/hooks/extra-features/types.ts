
import { Dispatch, SetStateAction } from "react";

export interface ExtraFeaturesState {
  importantLinks: boolean;
  siteInitiationTracker: boolean;
  repository: boolean;
  docPrinting: boolean;
  billOfMaterials: boolean;
  designSheet: boolean;
  workdayScheduled: boolean;
}

export const defaultFeatures: ExtraFeaturesState = {
  importantLinks: false,
  siteInitiationTracker: false,
  repository: false,
  docPrinting: false,
  billOfMaterials: false,
  designSheet: false,
  workdayScheduled: false,
};

export interface UseExtraFeaturesResult {
  features: ExtraFeaturesState;
  toggleFeature: (featureName: keyof ExtraFeaturesState, value?: boolean) => void;
  setFeatures: Dispatch<SetStateAction<ExtraFeaturesState>>;
  isLoading: boolean;
  saveProjectFeatures: (projectIds: string[], updatedFeatures: ExtraFeaturesState) => Promise<void>;
}
