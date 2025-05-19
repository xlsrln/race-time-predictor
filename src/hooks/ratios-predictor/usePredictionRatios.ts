
import { useState, useCallback } from 'react';
import { predictRaceTimeRatios } from '@/services/ratiosPredictorService';
import { SourceRaceEntryRatios, PredictionResultDataRatios } from '@/types/ratiosPredictor';
import { toast } from 'sonner';
import { timeToSeconds, validateHhMmSs } from '@/lib/timeUtils';


export function usePredictionRatios() {
  const [predictionResult, setPredictionResult] = useState<PredictionResultDataRatios | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionError, setPredictionError] = useState<Error | null>(null);

  const makePrediction = useCallback(async (sourceRaces: SourceRaceEntryRatios[], targetRaceName: string | null) => {
    if (!targetRaceName) {
      toast.error("Please select a target race.");
      setPredictionResult(null);
      return;
    }

    const validSourceRaces = sourceRaces.filter(entry => {
      if (!entry.raceId || !entry.time) {
        return false;
      }
      if (!validateHhMmSs(entry.time)) {
        toast.warning(`Invalid time format for a source race: ${entry.time}. Skipping this entry.`);
        return false;
      }
      const timeInSeconds = timeToSeconds(entry.time);
      if (timeInSeconds === null || timeInSeconds <=0) {
        toast.warning(`Time must be greater than zero for a source race: ${entry.time}. Skipping this entry.`);
        return false;
      }
      return true;
    });
    
    if (validSourceRaces.length === 0) {
      toast.error("Please provide at least one valid source race with time.");
      setPredictionResult(null);
      return;
    }

    setIsPredicting(true);
    setPredictionError(null);
    try {
      const result = await predictRaceTimeRatios(validSourceRaces, targetRaceName);
      setPredictionResult(result);
      toast.success("Prediction successful!");
    } catch (err) {
      console.error("Prediction failed for Ratios Model:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during prediction.";
      setPredictionError(new Error(errorMessage));
      toast.error(`Prediction failed: ${errorMessage}`);
      setPredictionResult(null);
    } finally {
      setIsPredicting(false);
    }
  }, []);

  return {
    predictionResult,
    isPredicting,
    predictionError,
    makePrediction,
  };
}
