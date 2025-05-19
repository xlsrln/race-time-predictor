
import React from 'react';
import { useRaceDataRatios } from '@/hooks/ratios-predictor/useRaceDataRatios';
import { usePredictionRatios } from '@/hooks/ratios-predictor/usePredictionRatios';
import PredictorLayout from '@/components/shared/PredictorLayout';
import TargetRaceSelectorRatios from './TargetRaceSelectorRatios'; // Is Read-only
import PredictionResultRatios from './PredictionResultRatios';
import { RaceSelectorItem } from '@/components/shared/RaceSelector';
import { Badge } from '@/components/ui/badge';

const RacePredictorRatiosContainer: React.FC = () => {
  const {
    raceNames,
    sourceRaces,
    targetRace,
    isLoading: isLoadingRaceData,
    error: raceDataError,
    setTargetRace,
    addSourceRace,
    removeSourceRace,
    updateSourceRace,
  } = useRaceDataRatios();

  const {
    predictionResult,
    isPredicting,
    // predictionError, // Available if needed for more detailed error display
    makePrediction,
  } = usePredictionRatios();

  const handlePredict = () => {
    makePrediction(sourceRaces, targetRace);
  };

  const raceSelectorItems: RaceSelectorItem[] = React.useMemo(() => 
    raceNames.map(name => ({ id: name, name })),
  [raceNames]);

  const sourceRacesFormProps = {
    formTitle: "Add race performance",
    entries: sourceRaces,
    raceSelectorItems: raceSelectorItems,
    onUpdateEntryRace: (entryId: string, raceId: string | null) => updateSourceRace(entryId, 'raceId', raceId || ''),
    onUpdateEntryTime: (entryId: string, time: string) => updateSourceRace(entryId, 'time', time),
    onAddEntry: addSourceRace,
    onRemoveEntry: removeSourceRace,
    isLoading: isLoadingRaceData || isPredicting,
    racePlaceholderPrefix: "Past Race",
    timeInputPlaceholder: "HH:MM"
  };
  
  const isPredictButtonDisabled = 
    isPredicting || 
    isLoadingRaceData || 
    !targetRace || 
    sourceRaces.length === 0 || 
    sourceRaces.every(sr => !sr.raceId || !sr.time);

  return (
    <PredictorLayout
      pageDescription="Compares the times of people who have done both races, and applies that ratio to your time. Contains most ultra races in Sweden."
      isLoadingInitialData={isLoadingRaceData}
      initialDataError={raceDataError}
      initialDataLoadingMessage="Loading race data for Common Runner Model..."
      noDataAvailableMessage="No race data available for the Common Runner Model. The source might be temporarily unavailable or empty."
      sourceRacesFormProps={sourceRacesFormProps}
      TargetRaceSelectorComponent={
        <TargetRaceSelectorRatios
          targetRace={targetRace}
          setTargetRace={setTargetRace}
          raceNames={raceNames} // TargetRaceSelectorRatios expects string[] for raceNames
          // The 'disabled' prop was removed here as TargetRaceSelectorRatiosProps doesn't define it, and the component is read-only.
          // disabled={isLoadingRaceData || raceNames.length === 0} 
        />
      }
      onPredict={handlePredict}
      predictButtonText={isPredicting ? "Predicting..." : "Predict My Time"}
      isPredictButtonDisabled={isPredictButtonDisabled}
      PredictionResultComponent={
        predictionResult ? (
          <PredictionResultRatios prediction={predictionResult} targetRaceName={targetRace || undefined} />
        ) : null
      }
      additionalBadges={
        <Badge variant="outline" className="border-green-500 text-green-600 dark:border-green-400 dark:text-green-300">
          Comparison based on runners in common
        </Badge>
      }
      footerPrimaryText="Conditions and courses vary year to year. Use as an indication only."
      footerSecondaryText="by axel sarlin"
    />
  );
};

export default RacePredictorRatiosContainer;
