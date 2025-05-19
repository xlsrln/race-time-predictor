
import { useState } from 'react';
import { predictTime, PredictionResult as ServicePredictionResult } from '../../../services/raceDataService';
import { toast } from 'sonner';
import { secondsToTime } from '../../../utils/timeUtils';

interface SourceRaceEntry {
  race: string;
  time: string;
}

export interface PredictionResult {
  avg: {
    time: string;
    min: string;
    max: string;
  } | string;
  median?: {
    time: string;
    min: string;
    max: string;
  };
  winner?: {
    time: string;
    min: string;
    max: string;
  };
}

export function usePrediction() {
  const [predictedResult, setPredictedResult] = useState<PredictionResult | null>(null);
  
  const handlePrediction = (sourceRaces: SourceRaceEntry[], targetRace: string) => {
    // Validate all entries
    const invalidEntries = sourceRaces.filter(entry => !entry.race || !entry.time);
    if (invalidEntries.length > 0 || !targetRace) {
      toast.warning("Please fill all fields");
      return;
    }
    
    // Validate time format for all entries (HH:MM format)
    const timePattern = /^(\d{1,2}):(\d{1,2})$/;
    const invalidTimes = sourceRaces.filter(entry => !timePattern.test(entry.time));
    if (invalidTimes.length > 0) {
      toast.warning("Please enter valid times in HH:MM format");
      return;
    }
    
    // Format times to ensure they're all in HH:MM:SS format for processing
    const formattedEntries = sourceRaces.map(entry => {
      // Add 00 seconds to the HH:MM format
      return {
        race: entry.race,
        time: `${entry.time}:00`
      };
    });
    
    // Get prediction for each source race
    const predictions = formattedEntries.map(entry => {
      return predictTime(entry.time, entry.race, targetRace);
    });
    
    // Check if all predictions have "No runners in common" or "No data available"
    const allNoData = predictions.every(pred => 
      pred.avg === "No data available" || pred.avg === "No runners in common"
    );
    
    if (allNoData && !predictions.some(pred => pred.median || pred.winner)) {
      if (predictions.some(pred => pred.avg === "No runners in common")) {
        toast.info("No runners in common between selected races and target race");
      } else {
        toast.error("No valid predictions available");
      }
      setPredictedResult({
        avg: predictions[0].avg // Use the first message
      });
      return;
    }
    
    // Initialize result object
    const result: PredictionResult = { 
      avg: "No runners in common" // Default message
    };
    
    // Process actual numeric predictions for avg if there are any
    const numericAvgPredictions = predictions
      .filter(p => p.avg !== "No runners in common" && p.avg !== "No data available")
      .map(p => p.avg as string);
    
    if (numericAvgPredictions.length > 0) {
      result.avg = processPredictions(numericAvgPredictions);
    }
    
    // Process median predictions if available
    const medianPredictions = predictions
      .map(p => p.median)
      .filter(p => p !== undefined && p !== "No runners in common" && p !== "No data available") as string[];
    
    if (medianPredictions.length > 0) {
      result.median = processPredictions(medianPredictions);
    }
    
    // Process winner predictions if available
    const winnerPredictions = predictions
      .map(p => p.winner)
      .filter(p => p !== undefined && p !== "No runners in common" && p !== "No data available") as string[];
    
    if (winnerPredictions.length > 0) {
      result.winner = processPredictions(winnerPredictions);
    }
    
    setPredictedResult(result);
  };
  
  function processPredictions(predictions: string[]): { time: string; min: string; max: string; } {
    // Calculate average, min, and max predictions
    const secondsArray = predictions.map(time => {
      const parts = time.split(':');
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2], 10);
      return hours * 3600 + minutes * 60 + seconds;
    });
    
    const totalSeconds = secondsArray.reduce((sum, seconds) => sum + seconds, 0);
    const averageSeconds = totalSeconds / predictions.length;
    const minSeconds = Math.min(...secondsArray);
    const maxSeconds = Math.max(...secondsArray);
    
    return {
      time: secondsToTime(averageSeconds),
      min: secondsToTime(minSeconds),
      max: secondsToTime(maxSeconds)
    };
  }
  
  return { predictedResult, handlePrediction };
}
