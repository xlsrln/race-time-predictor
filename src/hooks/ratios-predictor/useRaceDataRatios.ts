
import { useState, useEffect } from 'react';
import { fetchRaceDataRatios, getRaceNamesRatios } from '@/services/ratiosPredictorService'; // Updated import
import { toast } from 'sonner';
import { SourceRaceEntryRatios } from '@/types/ratiosPredictor'; // Updated import

export function useRaceDataRatios() {
  const [raceNames, setRaceNames] = useState<string[]>([]);
  const [sourceRaces, setSourceRaces] = useState<SourceRaceEntryRatios[]>([{ race: "", time: "" }]);
  const [targetRace, setTargetRace] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await fetchRaceDataRatios(); // Updated function call
        const names = getRaceNamesRatios(); // Updated function call
        
        setRaceNames(names);
        
        if (names.length > 0) {
          // Automatically select first race if available, or leave empty
          setSourceRaces([{ race: names[0] || "", time: "" }]);
          setTargetRace(names[0] || "");
        } else {
          setSourceRaces([{ race: "", time: "" }]);
          setTargetRace("");
        }
        
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load race data for ratios predictor.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const addSourceRace = () => {
    if (raceNames.length === 0) {
        setSourceRaces([...sourceRaces, { race: "", time: "" }]);
        return;
    }
    setSourceRaces([...sourceRaces, { race: raceNames[0] || "", time: "" }]);
  };
  
  const removeSourceRace = (index: number) => {
    if (sourceRaces.length === 1) {
      return;
    }
    const updatedRaces = [...sourceRaces];
    updatedRaces.splice(index, 1);
    setSourceRaces(updatedRaces);
  };
  
  const updateSourceRace = (index: number, field: 'race' | 'time', value: string) => {
    const updatedRaces = [...sourceRaces];
    updatedRaces[index] = { ...updatedRaces[index], [field]: value };
    setSourceRaces(updatedRaces);
  };
  
  return {
    raceNames,
    sourceRaces,
    targetRace,
    isLoading,
    error,
    setTargetRace,
    addSourceRace,
    removeSourceRace,
    updateSourceRace
  };
}
