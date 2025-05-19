export interface SourceRaceEntryRatios {
  id: string; // Unique identifier for the entry
  raceId: string | null; // Name of the race (acts as ID for ratios data)
  time: string;
}

export interface PredictionResultDataRatios {
  avg: string;
  median: string;
  winner: string; // This seems to be specific to the ratios model, perhaps a typo or legacy? Or winner time of target race?
                 // Let's assume it's part of the prediction specific to this model.
  sourceRacesCount: number;
}
