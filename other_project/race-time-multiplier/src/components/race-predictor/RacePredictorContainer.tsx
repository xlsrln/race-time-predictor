
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import SourceRaceForm from './SourceRaceForm';
import TargetRaceSelector from './TargetRaceSelector';
import PredictionResult from './PredictionResult';
import LoadingState from './LoadingState';

import { useRaceData } from './hooks/useRaceData';
import { usePrediction } from './hooks/usePrediction';

const RacePredictorContainer: React.FC = () => {
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
  } = useRaceData();
  
  const { predictedResult, handlePrediction } = usePrediction();
  
  const onPredictClick = () => {
    handlePrediction(sourceRaces, targetRace);
  };
  
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardDescription className="text-center">
          Predict your finish time for a race based on your performance in other races. 
          Currently contains a selection of ultra races in Sweden based on number of finishers. 
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <LoadingState isLoading={isLoading} error={error} />
        
        {!isLoading && !error && (
          <>
            <SourceRaceForm
              sourceRaces={sourceRaces}
              raceNames={raceNames}
              updateSourceRace={updateSourceRace}
              addSourceRace={addSourceRace}
              removeSourceRace={removeSourceRace}
            />
            
            <div className="flex items-center justify-center my-4">
              <ArrowRight className="text-muted-foreground" />
            </div>
            
            <TargetRaceSelector
              targetRace={targetRace}
              setTargetRace={setTargetRace}
              raceNames={raceNames}
            />
            
            <Button 
              className="w-full mt-4" 
              onClick={onPredictClick}
              disabled={!targetRace || sourceRaces.some(entry => !entry.race || !entry.time)}
            >
              Predict Time
            </Button>
            
            {sourceRaces.length > 1 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs">Using average of {sourceRaces.length} races</Badge>
              </div>
            )}
            
            {predictedResult && (
              <PredictionResult
                avg={predictedResult.avg}
                median={predictedResult.median}
                winner={predictedResult.winner}
                sourceRacesCount={sourceRaces.length}
              />
            )}
          </>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-center text-muted-foreground flex flex-col justify-center gap-2">
        <p>Based on historical data from race finishers who finished both races in the same year. Race conditions and routes may vary year to year. These predictions should be considered as indications only.</p>
        <p className="pt-2 text-xs font-medium">by axel sarlin</p>
      </CardFooter>
    </Card>
  );
};

export default RacePredictorContainer;
