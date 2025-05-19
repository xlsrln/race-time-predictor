
import { useState } from 'react';
import { predictTimeRatios, PredictionResultRatiosDTO } from '@/services/ratiosPredictorService'; // Updated imports
import { toast } from 'sonner';
import { secondsToTime as secondsToTimeRatios, timeToSeconds as timeToSecondsRatios } from '@/lib/timeUtilsRatios'; // Updated imports
import { SourceRaceEntryRatios, PredictionResultDisplayRatios, PredictionResultUIRatios } from '@/types/ratiosPredictor'; // Updated imports

export function usePredictionRatios() {
  const [predictedResult, setPredictedResult] = useState<PredictionResultUIRatios | null>(null);
  
  const handlePrediction = (sourceRaces: SourceRaceEntryRatios[], targetRace: string) => {
    const invalidEntries = sourceRaces.filter(entry => !entry.race || !entry.time);
    if (invalidEntries.length > 0 || !targetRace) {
      toast.warning("Please fill all race and time fields for past performances, and select a target race.");
      setPredictedResult(null); // Clear previous results
      return;
    }
    
    const timePattern = /^\d{1,2}:\d{2}$/; // HH:MM or M:MM
    const invalidTimes = sourceRaces.filter(entry => !timePattern.test(entry.time) || timeToSecondsRatios(entry.time + ":00") === 0);
    if (invalidTimes.length > 0) {
      toast.warning("Please enter valid times in HH:MM format (e.g., 03:45 or 3:45).");
      setPredictedResult(null);
      return;
    }
    
    const formattedEntries = sourceRaces.map(entry => ({
      race: entry.race,
      time: `${entry.time}:00` // Service expects HH:MM:SS
    }));
    
    const predictions: PredictionResultRatiosDTO[] = formattedEntries.map(entry => {
      return predictTimeRatios(entry.time, entry.race, targetRace);
    });
    
    const allNoDataOrCommon = predictions.every(pred => 
      pred.avg === "No data available" || pred.avg === "No runners in common"
    );
    
    if (allNoDataOrCommon && !predictions.some(pred => pred.median || pred.winner)) {
      const message = predictions.some(pred => pred.avg === "No runners in common")
        ? "No runners in common between selected races and target race."
        : "No prediction data available for the selected races.";
      toast.info(message);
      setPredictedResult({ avg: message, sourceRacesCount: sourceRaces.length });
      return;
    }
    
    const result: PredictionResultUIRatios = { 
      avg: "No runners in common", // Default for avg
      sourceRacesCount: sourceRaces.length
    };
    
    const processNumericPredictions = (predValues: (string | undefined)[]): PredictionResultDisplayRatios | undefined => {
      const numericPreds = predValues
        .filter(p => p && p !== "No runners in common" && p !== "No data available") as string[];
      if (numericPreds.length === 0) return undefined;
      
      const secondsArray = numericPreds.map(time => timeToSecondsRatios(time));
      const totalSeconds = secondsArray.reduce((sum, seconds) => sum + seconds, 0);
      const averageSeconds = totalSeconds / numericPreds.length;
      const minSeconds = Math.min(...secondsArray);
      const maxSeconds = Math.max(...secondsArray);
      
      return {
        time: secondsToTimeRatios(averageSeconds),
        min: secondsToTimeRatios(minSeconds),
        max: secondsToTimeRatios(maxSeconds)
      };
    };

    const avgPredictions = processNumericPredictions(predictions.map(p => p.avg));
    if (avgPredictions) result.avg = avgPredictions;
    else if (predictions.length > 0) result.avg = predictions[0].avg; // Fallback to first message if no numeric avg

    result.median = processNumericPredictions(predictions.map(p => p.median));
    result.winner = processNumericPredictions(predictions.map(p => p.winner));
    
    setPredictedResult(result);
    if (avgPredictions || result.median || result.winner) {
        toast.success("Prediction calculated!");
    } else {
        // This case might happen if avg was "No runners..." but median/winner were processed
        // Or if all were "No runners..." which is handled above.
        // Essentially, if we have some form of result but not numeric avg.
        toast.info("Prediction result available.");
    }
  };
  
  return { predictedResult, handlePrediction };
}
