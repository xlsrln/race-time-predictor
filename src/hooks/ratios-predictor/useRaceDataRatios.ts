
import { useState, useEffect, useCallback } from 'react';
import { fetchRaceNames } from '@/services/ratiosPredictorService';
import { SourceRaceEntryRatios } from '@/types/ratiosPredictor';
import { toast } from 'sonner';

export function useRaceDataRatios() {
  const [raceNames, setRaceNames] = useState<string[]>([]);
  const [sourceRaces, setSourceRaces] = useState<SourceRaceEntryRatios[]>([
    { id: Date.now().toString(), raceId: null, time: '' }
  ]);
  const [targetRace, setTargetRace] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadRaceNames = async () => {
      try {
        setIsLoading(true);
        const names = await fetchRaceNames();
        setRaceNames(names);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch race names for Ratios Predictor:", err);
        setError(err instanceof Error ? err : new Error('Failed to load race names'));
        toast.error("Could not load race data for Ratios Model.");
      } finally {
        setIsLoading(false);
      }
    };
    loadRaceNames();
  }, []);

  const addSourceRace = useCallback(() => {
    setSourceRaces(prev => [...prev, { id: Date.now().toString(), raceId: null, time: '' }]);
  }, []);

  const removeSourceRace = useCallback((idToRemove: string) => {
    setSourceRaces(prev => {
      const updatedRaces = prev.filter(race => race.id !== idToRemove);
      // Ensure there's always at least one entry form if all are removed
      if (updatedRaces.length === 0) {
        return [{ id: Date.now().toString(), raceId: null, time: '' }];
      }
      return updatedRaces;
    });
  }, []);

  const updateSourceRace = useCallback((idToUpdate: string, field: 'raceId' | 'time', value: string) => {
    setSourceRaces(prev =>
      prev.map(race =>
        race.id === idToUpdate ? { ...race, [field]: value } : race
      )
    );
  }, []);

  return {
    raceNames,
    sourceRaces,
    targetRace,
    isLoading,
    error,
    setTargetRace,
    addSourceRace,
    removeSourceRace,
    updateSourceRace,
  };
}
