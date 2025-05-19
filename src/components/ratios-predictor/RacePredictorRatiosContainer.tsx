
import React from 'react';
import PredictorLayout from '@/components/shared/PredictorLayout';
import GenericSourceRacesForm, { GenericRaceEntry } from '@/components/shared/GenericSourceRacesForm';
import TargetRaceSelectorRatios from './TargetRaceSelectorRatios';
import PredictionResultRatios from './PredictionResultRatios';
import { Badge } from "@/components/ui/badge";

import { useRaceDataRatios } from '@/hooks/ratios-predictor/useRaceDataRatios';
import { usePredictionRatios } from '@/hooks/ratios-predictor/usePredictionRatios';
import { RaceSelectorItem } from '@/components/shared/RaceSelector';
import { SourceRaceEntryRatios } from '@/types/ratiosPredictor'; // For casting, ensure it matches GenericRaceEntry

const RacePredictorRatiosContainer: React.FC = () => {
  const {
    raceNames,
    sourceRaces, // This is now SourceRaceEntryRatios[] which matches GenericRaceEntry[] structure
    targetRace,
    isLoading: isLoadingInitialData, // Renamed for clarity in PredictorLayout
    error: initialDataError, // Renamed for clarity
    setTargetRace,
    addSourceRace,
    removeSourceRace,
    updateSourceRace // This now handles {id, field, value} internally
  } = useRaceDataRatios();
  
  const { predictedResult, handlePrediction } = usePredictionRatios();

  const raceSelectorItems: RaceSelectorItem[] = React.useMemo(() => 
    raceNames.map(name => ({ id: name, name: name })),
    [raceNames]
  );
  
  const onPredictClick = () => {
    // Validation is good, handlePrediction hook also shows toast
    if (!targetRace || sourceRaces.some(entry => !entry.raceId || !entry.time)) {
        console.warn("Prediction attempted with incomplete form in Ratios Container.");
    }
    // Adapt sourceRaces if handlePrediction expects a different structure,
    // but usePredictionRatios now provides `SourceRaceEntryRatios[]`
    // which should be compatible with what `usePredictionRatios` expects
    // if it also uses `SourceRaceEntryRatios[]`. Let's assume it does.
    handlePrediction(sourceRaces as SourceRaceEntryRatios[], targetRace);
  };

  const genericSourceRaces: GenericRaceEntry[] = sourceRaces.map(sr => ({
    id: sr.id,
    raceId: sr.raceId, // raceId from SourceRaceEntryRatios
    time: sr.time,
  }));
  
  const sourceRacesFormProps = {
    formTitle: "Races you've completed",
    entries: genericSourceRaces,
    raceSelectorItems: raceSelectorItems,
    onUpdateEntryRace: (entryId: string, raceId: string | null) => updateSourceRace(entryId, 'raceId', raceId || ''),
    onUpdateEntryTime: (entryId: string, time: string) => updateSourceRace(entryId, 'time', time),
    onAddEntry: addSourceRace,
    onRemoveEntry: removeSourceRace,
    racePlaceholderPrefix: "Source Race",
    isLoading: isLoadingInitialData,
  };

  const TargetRaceSelectorComponent = (
    <TargetRaceSelectorRatios
      targetRace={targetRace}
      setTargetRace={setTargetRace}
      raceNames={raceNames}
      disabled={isLoadingInitialData || raceNames.length === 0}
    />
  );

  const PredictionResultComponent = predictedResult ? (
    <PredictionResultRatios
      avg={predictedResult.avg}
      median={predictedResult.median}
      winner={predictedResult.winner}
      sourceRacesCount={predictedResult.sourceRacesCount}
    />
  ) : null;

  const additionalBadges = sourceRaces.length > 1 ? (
    <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
      Using average of {sourceRaces.length} source races
    </Badge>
  ) : null;

  return (
    <PredictorLayout
      pageDescription="Predict your finish time using a model based on common runners between races. Contains a selection of ultra races in Sweden."
      isLoadingInitialData={isLoadingInitialData}
      initialDataError={initialDataError}
      initialDataErrorMessage="Could not load race data for the Common Runner Model. Please check your connection or try refreshing."
      noDataAvailableMessage="No race data available for the Common Runner Model."
      sourceRacesFormProps={sourceRacesFormProps}
      TargetRaceSelectorComponent={TargetRaceSelectorComponent}
      onPredict={onPredictClick}
      predictButtonText="Predict Time (Common Runner Model)"
      isPredictButtonDisabled={isLoadingInitialData || !targetRace || sourceRaces.some(entry => !entry.raceId || !entry.time)}
      additionalBadges={additionalBadges}
      PredictionResultComponent={PredictionResultComponent}
      footerPrimaryText="Predictions based on historical data from race finishers who completed both selected races in the same year. Conditions and routes can vary. Use as an indication only."
      footerSecondaryText="Common Runner Model by Axel Sarlin"
    />
  );
};

export default RacePredictorRatiosContainer;
