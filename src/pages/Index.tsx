import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, X } from 'lucide-react'; // Added X icon
import { cn } from '@/lib/utils';
import { Race } from '@/types/race';
import { timeToSeconds, secondsToHhMmSs, parseCsvDurationToSeconds } from '@/lib/timeUtils';
import { toast } from "sonner";
import { useQuery } from '@tanstack/react-query';
import Papa from 'papaparse';

// CSV URL
const CSV_URL = 'https://raw.githubusercontent.com/xlsrln/urtp/main/all_eu_wintimes.csv';

// Interface for CSV row structure
interface CsvRaceRow {
  country: string;
  event: string;
  name: string;
  dist_km: string;
  year: string;
  finishers: string; // Kept for completeness, though not directly used in Race type
  duration: string;
  "": string; // Handle potential empty last column from some CSV exports
}

// Function to fetch and process race data
const fetchAndProcessRaces = async (): Promise<Race[]> => {
  const response = await fetch(CSV_URL);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to fetch race data:', response.status, errorText);
    throw new Error(`Failed to fetch race data: ${response.status}`);
  }
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<CsvRaceRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn("CSV parsing errors encountered:", results.errors);
        }
        
        const processedRaces = results.data
          .map((row, index) => {
            if (!row.country || !row.event || !row.name || !row.dist_km || !row.year || !row.duration) {
              return null; 
            }

            const distKmNum = parseFloat(row.dist_km);
            const yearNum = parseInt(row.year, 10); // Year is still parsed for data integrity but not used in display name
            const winnerTimeSeconds = parseCsvDurationToSeconds(row.duration);

            if (isNaN(distKmNum) || distKmNum <= 0 || isNaN(yearNum) || winnerTimeSeconds === null || winnerTimeSeconds <= 0) {
              return null;
            }

            return {
              id: `${row.country}-${row.event}-${row.year}-${index}`,
              name: `${row.name} (${distKmNum}km)`, // Year removed from display name
              country: row.country,
              distKm: distKmNum,
              year: yearNum, // Keep year in data object
              winnerTimeSeconds: winnerTimeSeconds,
            };
          })
          .filter(race => race !== null) as Race[];
        
        if (processedRaces.length === 0 && results.data.length > 0) {
          console.warn("All CSV rows were filtered out after processing. Check data quality and parsing logic.");
        }
        resolve(processedRaces);
      },
      error: (error: Error) => {
        console.error("Papaparse critical error:", error);
        reject(new Error('Failed to parse CSV data due to a Papaparse error.'));
      }
    });
  });
};

interface PastPerformanceEntry {
  id: string; // unique key for react list
  raceId: string | null;
  timeInput: string;
}

const Index = () => {
  const { data: races = [], isLoading: isLoadingRaces, isError: isErrorRaces, error: errorRaces } = useQuery<Race[], Error>({
    queryKey: ['races'], 
    queryFn: fetchAndProcessRaces,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  const [pastPerformances, setPastPerformances] = useState<PastPerformanceEntry[]>([
    { id: Date.now().toString(), raceId: null, timeInput: '' }
  ]);
  const [selectedTargetRaceId, setSelectedTargetRaceId] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<{ average: string; min: string; max: string; count: number; } | null>(null); // Added count
  
  const [targetRacePopoverOpen, setTargetRacePopoverOpen] = useState(false);

  const selectedTargetRace = useMemo(() => races.find(r => r.id === selectedTargetRaceId), [races, selectedTargetRaceId]);

  const addPastPerformanceEntry = () => {
    setPastPerformances(prev => [...prev, { id: Date.now().toString(), raceId: null, timeInput: '' }]);
  };

  const updatePastPerformanceRace = (id: string, raceId: string | null) => {
    setPastPerformances(prev => prev.map(p => p.id === id ? { ...p, raceId } : p));
  };

  const updatePastPerformanceTime = (id: string, timeInput: string) => {
    setPastPerformances(prev => prev.map(p => p.id === id ? { ...p, timeInput } : p));
  };

  const removePastPerformanceEntry = (id: string) => {
    setPastPerformances(prev => {
      const newPerformances = prev.filter(p => p.id !== id);
      // If all are removed, add a new blank one back
      if (newPerformances.length === 0) {
        return [{ id: Date.now().toString(), raceId: null, timeInput: '' }];
      }
      return newPerformances;
    });
  };

  const handlePredictTime = () => {
    if (pastPerformances.length === 0 || pastPerformances.every(p => !p.raceId || !p.timeInput)) {
      toast.error("Please add and complete at least one past race performance.");
      setPredictionResult(null);
      return;
    }
    if (!selectedTargetRace) {
      toast.error("Please select a target race.");
      setPredictionResult(null);
      return;
    }

    const individualPredictionsSeconds: number[] = [];

    for (const perf of pastPerformances) {
      if (!perf.raceId || !perf.timeInput) {
        continue; 
      }
      const pastRaceDetails = races.find(r => r.id === perf.raceId);
      if (!pastRaceDetails) {
        toast.warning(`Could not find details for a past race. Skipping this entry.`);
        continue;
      }

      const userTimeInSeconds = timeToSeconds(perf.timeInput);
      if (userTimeInSeconds === null || userTimeInSeconds <= 0) {
        toast.warning(`Invalid time format for "${pastRaceDetails.name}": ${perf.timeInput}. Skipping this entry.`);
        continue;
      }

      if (pastRaceDetails.winnerTimeSeconds <= 0 || selectedTargetRace.winnerTimeSeconds <= 0) {
          toast.warning(`Race data is incomplete for "${pastRaceDetails.name}" or target race. Skipping prediction for this entry.`);
          continue;
      }

      const predictionFactor = userTimeInSeconds / pastRaceDetails.winnerTimeSeconds;
      const predictedTimeInSeconds = selectedTargetRace.winnerTimeSeconds * predictionFactor;
      individualPredictionsSeconds.push(predictedTimeInSeconds);
    }

    if (individualPredictionsSeconds.length === 0) {
      toast.error("No valid past performances to make a prediction. Please check your entries.");
      setPredictionResult(null);
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
      count: individualPredictionsSeconds.length, // Store the count
    });
    toast.success("Prediction successful!");
  };

  // Refactored RaceSelector to manage its own popover state
  const RaceSelector = ({
    selectedValue,
    onSelectValue,
    placeholder,
    racesData
  }: {
    selectedValue: Race | undefined;
    onSelectValue: (value: string | null) => void;
    placeholder: string;
    racesData: Race[];
  }) => {
    const [open, setOpen] = React.useState(false);
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-sm md:text-base border-gray-300 text-gray-700 hover:bg-gray-50" // Light theme
          >
            {selectedValue ? selectedValue.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0 bg-white border-gray-300"> {/* Light theme */}
          <Command>
            <CommandInput placeholder="Search race..." className="border-gray-300 text-gray-900" /> {/* Light theme */}
            <CommandList>
              <CommandEmpty className="text-gray-600">No race found.</CommandEmpty> {/* Light theme */}
              <CommandGroup>
                {racesData.map((race) => (
                  <CommandItem
                    key={race.id}
                    value={race.name}
                    onSelect={() => {
                      onSelectValue(race.id);
                      setOpen(false);
                    }}
                    className="text-gray-800 hover:bg-gray-100 data-[selected='true']:bg-blue-100 data-[selected=true]:text-blue-700" // Light theme
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValue?.id === race.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {race.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  if (isLoadingRaces) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4 text-gray-800"> {/* Light theme */}
        <p className="text-xl">Loading race data...</p>
      </div>
    );
  }

  if (isErrorRaces) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4 text-gray-800"> {/* Light theme */}
        <div className="text-center">
          <p className="text-xl text-red-600">Error loading race data</p> {/* Light theme */}
          <p className="text-gray-600">{(errorRaces as Error)?.message || 'An unknown error occurred.'}</p> {/* Light theme */}
          <p className="text-gray-500 mt-2">Please check your internet connection or try again later.</p> {/* Light theme */}
        </div>
      </div>
    );
  }
  
  if (!isLoadingRaces && !isErrorRaces && races.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4 text-gray-800"> {/* Light theme */}
        <div className="text-center">
          <p className="text-xl">No Race Data Available</p>
          <p className="text-gray-600">The race data source might be empty, temporarily unavailable, or all data was invalid.</p> {/* Light theme */}
           <p className="text-gray-500 mt-2">Please try again later or contact support if the issue persists.</p> {/* Light theme */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4"> {/* Light theme */}
      <Card className="w-full max-w-2xl shadow-2xl bg-white border-gray-300 text-gray-900"> {/* Light theme, wider card */}
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"> {/* Light theme gradient */}
            Race Time Predictor
          </CardTitle>
          <CardDescription className="text-gray-600"> {/* Light theme */}
            Estimate your time for a target race based on past performances.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Your Past Performances</h3> {/* Light theme */}
            {pastPerformances.map((perf, index) => (
              <div key={perf.id} className="space-y-3 p-3 mb-3 border border-gray-200 rounded-md bg-gray-50 relative"> {/* Light theme */}
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700"> {/* Light theme */}
                    Past Race #{index + 1}
                  </label>
                  {pastPerformances.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePastPerformanceEntry(perf.id)}
                      className="text-red-500 hover:bg-red-100 p-1" // Light theme
                    >
                      <X size={18} />
                    </Button>
                  )}
                </div>
                <RaceSelector
                  selectedValue={races.find(r => r.id === perf.raceId)}
                  onSelectValue={(raceId) => updatePastPerformanceRace(perf.id, raceId)}
                  placeholder="Select past race"
                  racesData={races}
                />
                <Input
                  type="text"
                  placeholder="e.g., 03:45:30 (HH:MM:SS)"
                  value={perf.timeInput}
                  onChange={(e) => updatePastPerformanceTime(perf.id, e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" /* Light theme */
                />
              </div>
            ))}
            <Button 
              onClick={addPastPerformanceEntry} 
              variant="outline" 
              className="w-full mt-2 border-blue-500 text-blue-600 hover:bg-blue-50" /* Light theme */
            >
              Add Another Past Performance
            </Button>
          </div>

          <div className="space-y-2">
            <label htmlFor="target-race" className="block text-sm font-medium text-gray-700"> {/* Light theme */}
              Target Race
            </label>
            <RaceSelector
              selectedValue={selectedTargetRace}
              onSelectValue={setSelectedTargetRaceId}
              placeholder="Select your target race"
              racesData={races}
            />
          </div>

          <Button 
            onClick={handlePredictTime} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base" /* Light theme */
            disabled={isLoadingRaces || races.length === 0}
          >
            Predict My Time
          </Button>
        </CardContent>

        {predictionResult && (
          <CardFooter className="flex flex-col items-center justify-center pt-6 border-t border-gray-200"> {/* Light theme */}
            <p className="text-sm text-gray-600 mb-1">Predicted Time for {selectedTargetRace?.name}:</p> {/* Light theme */}
            {predictionResult.count === 1 ? (
              <div>
                <p className="text-3xl font-bold text-blue-600">{predictionResult.average}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center w-full">
                <div>
                  <p className="text-xs text-gray-500">MIN</p>
                  <p className="text-2xl font-semibold text-blue-500">{predictionResult.min}</p> {/* Light theme */}
                </div>
                <div>
                  <p className="text-xs text-gray-500">AVERAGE</p>
                  <p className="text-3xl font-bold text-blue-600">{predictionResult.average}</p> {/* Light theme */}
                </div>
                <div>
                  <p className="text-xs text-gray-500">MAX</p>
                  <p className="text-2xl font-semibold text-blue-500">{predictionResult.max}</p> {/* Light theme */}
                </div>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default Index;
