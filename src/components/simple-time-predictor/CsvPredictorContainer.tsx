
import React, { useState } from 'react';
import { useCsvData } from '@/hooks/csv-predictor/useCsvData';
import PredictorLayout from '@/components/shared/PredictorLayout';
import TargetRaceSelectorCsv from './TargetRaceSelectorCsv';
import PredictionResultCsvDisplay from './PredictionResultCsv'; // Renamed for clarity if PredictionResultCsv is a type
import { PredictionResultCsv as PredictionResultCsvType } from '@/types/csvPredictor';
import { toast } from 'sonner';
import { timeToSeconds, secondsToHhMmSs, validateHhMmSs } from '@/lib/timeUtils'; // validateHhMmSs should now be available
import { Badge } from '@/components/ui/badge';

const CsvPredictorContainer: React.FC = () => {
  const {
    races,
    isLoadingRaces,
    isErrorRaces,
    errorRaces,
    pastPerformances,
    selectedTargetRaceId,
    selectedTargetRace,
    raceSelectorItems,
    addPastPerformanceEntry,
    updatePastPerformanceEntry,
    removePastPerformanceEntry,
    setSelectedTargetRaceId,
  } = useCsvData();

  const [predictionResult, setPredictionResult] = useState<PredictionResultCsvType | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const handlePredictTime = () => {
    if (pastPerformances.length === 0 || pastPerformances.every(p => !p.raceId || !p.timeInput)) {
      toast.error("Please add and complete at least one past race performance");
      setPredictionResult(null);
      return;
    }
    if (!selectedTargetRace) {
      toast.error("Please select a target race.");
      setPredictionResult(null);
      return;
    }

    setIsPredicting(true);
    const individualPredictionsSeconds: number[] = [];

    for (const perf of pastPerformances) {
      if (!perf.raceId || !perf.timeInput) {
        continue; 
      }
      // Use the newly available validateHhMmSs
      if (!validateHhMmSs(perf.timeInput)) {
        toast.warning(`Invalid time format for a past performance: ${perf.timeInput}. Skipping this entry.`);
        continue;
      }

      const pastRaceDetails = races.find(r => r.id === perf.raceId);
      if (!pastRaceDetails) {
        toast.warning(`Could not find details for a past race. Skipping this entry.`);
        continue;
      }

      const userTimeInSeconds = timeToSeconds(perf.timeInput);
      // timeToSeconds now returns null for invalid, so validateHhMmSs check above is primary.
      // This check handles if time is zero or negative after successful parsing.
      if (userTimeInSeconds === null || userTimeInSeconds <= 0) { 
        toast.warning(`Invalid or non-positive time value for "${pastRaceDetails.name}": ${perf.timeInput}. Skipping this entry.`);
        continue;
      }

      if (pastRaceDetails.winnerTimeSeconds <= 0 || selectedTargetRace.winnerTimeSeconds <= 0) {
          toast.warning(`Race data (winner times) is incomplete for "${pastRaceDetails.name}" or target race "${selectedTargetRace.name}". Skipping prediction for this entry.`);
          continue;
      }

      const predictionFactor = userTimeInSeconds / pastRaceDetails.winnerTimeSeconds;
      const predictedTimeInSeconds = selectedTargetRace.winnerTimeSeconds * predictionFactor;
      individualPredictionsSeconds.push(predictedTimeInSeconds);
    }

    if (individualPredictionsSeconds.length === 0) {
      toast.error("No valid past performances to make a prediction. Please check your entries or race data.");
      setPredictionResult(null);
      setIsPredicting(false);
      return;
    }

    const sum = individualPredictionsSeconds.reduce((acc, curr) => acc + curr, 0);
    const averageSeconds = sum / individualPredictionsSeconds.length;
    const minSeconds = Math.min(...individualPredictionsSeconds);
    const maxSeconds = Math.max(...individualPredictionsSeconds);

    setPredictionResult({
      average: secondsToHhMmSs(averageSeconds),
      min: secondsToHhMmSs(minSeconds),
      max: secondsToHhMmSs(maxSeconds),
      count: individualPredictionsSeconds.length,
    });
    toast.success(`Prediction successful based on ${individualPredictionsSeconds.length} past performance(s)!`);
    setIsPredicting(false);
  };
  
  const sourceRacesFormProps = {
    formTitle: "Add race performance",
    entries: pastPerformances.map(p => ({ id: p.id, raceId: p.raceId, time: p.timeInput })),
    raceSelectorItems: raceSelectorItems,
    onUpdateEntryRace: (entryId: string, raceId: string | null) => updatePastPerformanceEntry(entryId, 'raceId', raceId),
    onUpdateEntryTime: (entryId: string, time: string) => updatePastPerformanceEntry(entryId, 'timeInput', time),
    onAddEntry: addPastPerformanceEntry,
    onRemoveEntry: removePastPerformanceEntry,
    isLoading: isLoadingRaces || isPredicting,
    racePlaceholderPrefix: "Past Race",
    timeInputPlaceholder: "HH:MM"
  };

  const isPredictButtonDisabled = 
    isPredicting || 
    isLoadingRaces || 
    races.length === 0 || // also implies raceSelectorItems.length === 0
    !selectedTargetRaceId || 
    pastPerformances.length === 0 || 
    pastPerformances.every(p => !p.raceId || !p.timeInput.trim()); // Check for empty time input too

  return (
    <PredictorLayout
      pageDescription="Compares winning times of both races, and applies that ratio to your time. Contains data for most ultra races in Europe."
      isLoadingInitialData={isLoadingRaces}
      initialDataError={isErrorRaces ? errorRaces : null}
      initialDataLoadingMessage="Loading CSV race data for Winner Time Model..."
      noDataAvailableMessage="No race data available for the Winner Time Model. The CSV source might be empty or temporarily unavailable."
      sourceRacesFormProps={sourceRacesFormProps}
      TargetRaceSelectorComponent={
        <TargetRaceSelectorCsv
          selectedValueId={selectedTargetRaceId}
          onSelectValue={setSelectedTargetRaceId}
          items={raceSelectorItems}
          isLoading={isLoadingRaces}
          disabled={races.length === 0}
        />
      }
      onPredict={handlePredictTime}
      predictButtonText={isPredicting ? "Predicting..." : "Predict My Time"}
      isPredictButtonDisabled={isPredictButtonDisabled}
      PredictionResultComponent={
        predictionResult ? (
          <PredictionResultCsvDisplay result={predictionResult} targetRaceName={selectedTargetRace?.name} />
        ) : null
      }
      additionalBadges={
        <Badge variant="outline" className="border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-300">
          Comparison based on winner times
        </Badge>
      }
      footerPrimaryText="Conditions and courses vary year to year. Use as an indication only."
      footerSecondaryText="by axel sarlin"
    />
  );
};

export default CsvPredictorContainer;
