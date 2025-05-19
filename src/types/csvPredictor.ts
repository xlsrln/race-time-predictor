
import { Race } from '@/types/race';

export interface CsvRaceRow {
  country: string;
  event: string;
  name: string;
  dist_km: string;
  year: string;
  finishers: string;
  duration: string;
  "": string; // PapaParse might add an empty key for trailing commas
}

export interface PastPerformanceEntry {
  id: string;
  raceId: string | null; // Corresponds to Race['id']
  timeInput: string; // User's time for this past race
}

export interface PredictionResultCsv {
  average: string;
  min: string;
  max: string;
  count: number;
}

// Re-export Race type if it's closely tied to this predictor, or ensure it's imported where needed.
// For now, Race is imported from @/types/race directly in components/hooks.
