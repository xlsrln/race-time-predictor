
import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAndProcessRaces } from '@/services/csvPredictorService';
import { Race } from '@/types/race';
import { PastPerformanceEntry } from '@/types/csvPredictor';
import { RaceSelectorItem } from '@/components/shared/RaceSelector';

export function useCsvData() {
  const { data: races = [], isLoading: isLoadingRaces, isError: isErrorRaces, error: errorRaces } = useQuery<Race[], Error>({
    queryKey: ['racesCSV'], 
    queryFn: fetchAndProcessRaces,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });

  const [pastPerformances, setPastPerformances] = useState<PastPerformanceEntry[]>([
    { id: Date.now().toString(), raceId: null, timeInput: '' }
  ]);
  const [selectedTargetRaceId, setSelectedTargetRaceId] = useState<string | null>(null);

  const raceSelectorItems: RaceSelectorItem[] = useMemo(() => 
    races.map(r => ({ id: r.id, name: r.name })), 
  [races]);

  const selectedTargetRace = useMemo(() => {
    if (!selectedTargetRaceId) return null;
    return races.find(r => r.id === selectedTargetRaceId) || null;
  }, [selectedTargetRaceId, races]);

  const addPastPerformanceEntry = useCallback(() => {
    setPastPerformances(prev => [...prev, { id: Date.now().toString(), raceId: null, timeInput: '' }]);
  }, []);

  const updatePastPerformanceEntry = useCallback((idToUpdate: string, field: 'raceId' | 'timeInput', value: string | null) => {
    setPastPerformances(prev =>
      prev.map(perf =>
        perf.id === idToUpdate ? { ...perf, [field]: field === 'raceId' ? value : value || '' } : perf
      )
    );
  }, []);
  
  const removePastPerformanceEntry = useCallback((idToRemove: string) => {
    setPastPerformances(prev => {
      const updatedPerformances = prev.filter(p => p.id !== idToRemove);
      if (updatedPerformances.length === 0) {
        return [{ id: Date.now().toString(), raceId: null, timeInput: '' }];
      }
      return updatedPerformances;
    });
  }, []);

  return {
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
  };
}
