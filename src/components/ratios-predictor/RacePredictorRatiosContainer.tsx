
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowRight } from "lucide-react"; // Keep, it's used for visual separation
import { Badge } from "@/components/ui/badge";

import SourceRaceFormRatios from './SourceRaceFormRatios';
import TargetRaceSelectorRatios from './TargetRaceSelectorRatios';
import PredictionResultRatios from './PredictionResultRatios';
import LoadingStateRatios from './LoadingStateRatios';

import { useRaceDataRatios } from '@/hooks/ratios-predictor/useRaceDataRatios';
import { usePredictionRatios } from '@/hooks/ratios-predictor/usePredictionRatios';

const RacePredictorRatiosContainer: React.FC = () => {
  const {
    raceNames,
    sourceRaces,
    targetRace,
    isLoading,
    error,
    setTargetRace,
    addSourceRace,
    removeSourceRace,
    updateSourceRace
  } = useRaceDataRatios();
  
  const { predictedResult, handlePrediction } = usePredictionRatios();
  
  const onPredictClick = () => {
    // Basic validation before calling hook
    if (!targetRace || sourceRaces.some(entry => !entry.race || !entry.time)) {
        // The hook itself will show a toast, but we can prevent call
        console.warn("Prediction attempted with incomplete form in Ratios Container.");
        // Potentially show a more specific message or rely on the hook's toast
    }
    handlePrediction(sourceRaces, targetRace);
  };
  
  return (
    <Card className="w-full max-w-3xl shadow-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardDescription className="text-center text-gray-600 dark:text-gray-400">
          Predict your finish time using a model based on common runners between races. 
          Contains a selection of ultra races in Sweden.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 p-4 md:p-6">
        <LoadingStateRatios isLoading={isLoading} error={error} />
        
        {!isLoading && !error && (
          <>
            <SourceRaceFormRatios
              sourceRaces={sourceRaces}
              raceNames={raceNames}
              updateSourceRace={updateSourceRace}
              addSourceRace={addSourceRace}
              removeSourceRace={removeSourceRace}
            />
            
            <div className="flex items-center justify-center my-4">
              <ArrowRight className="h-6 w-6 text-muted-foreground dark:text-gray-500" />
            </div>
            
            <TargetRaceSelectorRatios
              targetRace={targetRace}
              setTargetRace={setTargetRace}
              raceNames={raceNames}
            />
            
            <Button 
              className="w-full mt-6 py-3 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600" 
              onClick={onPredictClick}
              disabled={isLoading || !targetRace || sourceRaces.some(entry => !entry.race || !entry.time)}
            >
              Predict Time (Ratios Model)
            </Button>
            
            {sourceRaces.length > 1 && (
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">Using average of {sourceRaces.length} source races</Badge>
              </div>
            )}
            
            {predictedResult && (
              <PredictionResultRatios
                avg={predictedResult.avg}
                median={predictedResult.median}
                winner={predictedResult.winner}
                sourceRacesCount={predictedResult.sourceRacesCount}
              />
            )}
          </>
        )}
         {!isLoading && error && raceNames.length === 0 && (
            <p className="text-center text-sm text-muted-foreground dark:text-gray-400 mt-4">
                Could not load initial race data. Please check your connection or try refreshing.
            </p>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-center text-muted-foreground dark:text-gray-500 flex flex-col justify-center gap-2 py-4 border-t dark:border-gray-700">
        <p>Predictions based on historical data from race finishers who completed both selected races in the same year. Conditions and routes can vary. Use as an indication only.</p>
        <p className="pt-2 text-xs font-medium">Ratios Model by Axel Sarlin</p>
      </CardFooter>
    </Card>
  );
};

export default RacePredictorRatiosContainer;
