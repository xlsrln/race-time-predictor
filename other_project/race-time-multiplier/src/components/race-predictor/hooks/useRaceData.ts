
import { useState, useEffect } from 'react';
import { fetchRaceData, getRaceNames } from '../../../services/raceDataService';
import { toast } from 'sonner';

interface SourceRaceEntry {
  race: string;
  time: string;
}

export function useRaceData() {
  const [raceNames, setRaceNames] = useState<string[]>([]);
  const [sourceRaces, setSourceRaces] = useState<SourceRaceEntry[]>([{ race: "", time: "" }]);
  const [targetRace, setTargetRace] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await fetchRaceData();
        const names = getRaceNames();
        
        setRaceNames(names);
        
        if (names.length > 0) {
          setSourceRaces([{ race: names[0], time: "" }]);
          setTargetRace(names[0]);
        }
        
        setError(null);
      } catch (err) {
        setError("Failed to load race data. Please try again later.");
        toast.error("Failed to load race data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const addSourceRace = () => {
    if (raceNames.length === 0) return;
    setSourceRaces([...sourceRaces, { race: raceNames[0], time: "" }]);
  };
  
  const removeSourceRace = (index: number) => {
    if (sourceRaces.length === 1) {
      // Don't remove the last one
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
