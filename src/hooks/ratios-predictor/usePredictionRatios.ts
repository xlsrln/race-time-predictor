
import { useState, useCallback } from 'react';
import { predictTimeRatios } from '@/services/ratiosPredictorService'; // Updated import
import { SourceRaceEntryRatios, PredictionResultDataRatios } from '@/types/ratiosPredictor';
import { toast } from 'sonner';
import { timeToSeconds, secondsToHhMmSs, validateHhMmSs } from '@/lib/timeUtils'; // Ensure all are imported

// Helper to convert prediction string (which might be "No data", etc.) to seconds
const predictionStringToSeconds = (timeStr: string | undefined): number | null => {
  if (!timeStr || timeStr.toLowerCase().includes("no data") || timeStr.toLowerCase().includes("n/a") || timeStr.trim() === "") {
    return null;
  }
  return timeToSeconds(timeStr);
};

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
      if (timeInSeconds === null || timeInSeconds <= 0) {
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
      const allPredictedAvgSeconds: number[] = [];
      const allPredictedMedianSeconds: number[] = [];
      const allPredictedWinnerSeconds: number[] = [];

      for (const entry of validSourceRaces) {
        // entry.raceId and targetRaceName are confirmed to be non-null by this point
        const singlePredResult = predictTimeRatios(entry.time, entry.raceId!, targetRaceName);
        
        const avgSec = predictionStringToSeconds(singlePredResult.avg);
        if (avgSec !== null && avgSec > 0) allPredictedAvgSeconds.push(avgSec);

        if (singlePredResult.median) {
          const medianSec = predictionStringToSeconds(singlePredResult.median);
          if (medianSec !== null && medianSec > 0) allPredictedMedianSeconds.push(medianSec);
        }
        if (singlePredResult.winner) {
          const winnerSec = predictionStringToSeconds(singlePredResult.winner);
          if (winnerSec !== null && winnerSec > 0) allPredictedWinnerSeconds.push(winnerSec);
        }
      }

      if (allPredictedAvgSeconds.length === 0) {
        toast.error("Could not generate any valid predictions from the provided source races. Check if data is available for these race pairs.");
        setPredictionResult(null);
        setIsPredicting(false);
        return;
      }

      const calculateAverageSeconds = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

      const finalAvgSeconds = calculateAverageSeconds(allPredictedAvgSeconds);
      const finalAvg = secondsToHhMmSs(finalAvgSeconds);
      
      const finalMedianSeconds = calculateAverageSeconds(allPredictedMedianSeconds);
      const finalMedian = allPredictedMedianSeconds.length > 0 ? secondsToHhMmSs(finalMedianSeconds) : "N/A";
      
      const finalWinnerSeconds = calculateAverageSeconds(allPredictedWinnerSeconds);
      const finalWinner = allPredictedWinnerSeconds.length > 0 ? secondsToHhMmSs(finalWinnerSeconds) : "N/A";

      setPredictionResult({
        avg: finalAvg,
        median: finalMedian,
        winner: finalWinner,
        sourceRacesCount: allPredictedAvgSeconds.length, // Number of races contributing to the average
      });
      toast.success(`Prediction successful based on ${allPredictedAvgSeconds.length} source race(s)!`);

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
