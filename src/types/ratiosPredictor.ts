
export interface SourceRaceEntryRatios { // Renamed
  race: string;
  time: string;
}

export interface PredictionResultDisplayRatios { // Renamed
  time: string;
  min: string;
  max: string;
}

// This matches the structure expected by PredictionResultRatios component
export interface PredictionResultUIRatios {
  avg: PredictionResultDisplayRatios | string; // Can be an error string
  median?: PredictionResultDisplayRatios;
  winner?: PredictionResultDisplayRatios;
  sourceRacesCount: number; // Added to match component prop
}
