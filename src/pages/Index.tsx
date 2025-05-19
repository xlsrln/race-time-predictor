import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
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
      dynamicTyping: false, // Parse all as strings first
      complete: (results) => {
        if (results.errors.length > 0) {
          // Log errors but try to process valid data
          console.warn("CSV parsing errors encountered:", results.errors);
          // Depending on severity, you might want to reject if crucial data is missing or malformed
          // For now, we'll proceed with successfully parsed rows
        }
        
        const processedRaces = results.data
          .map((row, index) => {
            // Basic validation for required fields from CSV
            if (!row.country || !row.event || !row.name || !row.dist_km || !row.year || !row.duration) {
              // console.warn(`Skipping incomplete row at index ${index}:`, row);
              return null; 
            }

            const distKmNum = parseFloat(row.dist_km);
            const yearNum = parseInt(row.year, 10);
            const winnerTimeSeconds = parseCsvDurationToSeconds(row.duration);

            if (isNaN(distKmNum) || distKmNum <= 0 || isNaN(yearNum) || winnerTimeSeconds === null || winnerTimeSeconds <= 0) {
              // console.warn(`Skipping row with invalid/incomplete data for processing at index ${index}:`, row);
              return null;
            }

            return {
              id: `${row.country}-${row.event}-${row.year}-${index}`, // Index ensures uniqueness if event ID isn't globally unique
              name: `${row.name} (${distKmNum}km, ${yearNum})`,
              country: row.country,
              distKm: distKmNum,
              year: yearNum,
              winnerTimeSeconds: winnerTimeSeconds,
            };
          })
          .filter(race => race !== null) as Race[]; // Type assertion after filtering nulls
        
        if (processedRaces.length === 0 && results.data.length > 0) {
          // This means all rows were filtered out, potentially due to data quality issues or strict filtering
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

const Index = () => {
  const { data: races = [], isLoading: isLoadingRaces, isError: isErrorRaces, error: errorRaces } = useQuery<Race[], Error>({
    queryKey: ['races'], 
    queryFn: fetchAndProcessRaces,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    refetchOnWindowFocus: false, // Optional: prevent refetch on window focus
  });

  const [selectedPastRaceId, setSelectedPastRaceId] = useState<string | null>(null);
  const [userTimeInput, setUserTimeInput] = useState<string>('');
  const [selectedTargetRaceId, setSelectedTargetRaceId] = useState<string | null>(null);
  const [predictedTime, setPredictedTime] = useState<string | null>(null);

  const [pastRacePopoverOpen, setPastRacePopoverOpen] = useState(false);
  const [targetRacePopoverOpen, setTargetRacePopoverOpen] = useState(false);

  const selectedPastRace = useMemo(() => races.find(r => r.id === selectedPastRaceId), [races, selectedPastRaceId]);
  const selectedTargetRace = useMemo(() => races.find(r => r.id === selectedTargetRaceId), [races, selectedTargetRaceId]);

  const handlePredictTime = () => {
    if (!selectedPastRace || !selectedTargetRace) {
      toast.error("Please select both your past race and a target race.");
      setPredictedTime(null);
      return;
    }

    const userTimeInSeconds = timeToSeconds(userTimeInput);
    if (userTimeInSeconds === null || userTimeInSeconds <= 0) {
      toast.error("Please enter a valid time for your past race (e.g., HH:MM or HH:MM:SS).");
      setPredictedTime(null);
      return;
    }

    if (selectedPastRace.winnerTimeSeconds <= 0 || selectedTargetRace.winnerTimeSeconds <= 0) {
        toast.error("Selected race data is incomplete. Cannot perform prediction.");
        setPredictedTime(null);
        return;
    }

    const predictionFactor = userTimeInSeconds / selectedPastRace.winnerTimeSeconds;
    const predictedTimeInSeconds = selectedTargetRace.winnerTimeSeconds * predictionFactor;
    
    setPredictedTime(secondsToHhMmSs(predictedTimeInSeconds));
    toast.success("Prediction successful!");
  };

  const RaceSelector = ({
    popoverOpen,
    setPopoverOpen,
    selectedValue,
    onSelectValue,
    placeholder,
    racesData // Added racesData prop
  }: {
    popoverOpen: boolean;
    setPopoverOpen: (open: boolean) => void;
    selectedValue: Race | undefined;
    onSelectValue: (value: string | null) => void;
    placeholder: string;
    racesData: Race[]; // Explicitly pass races data
  }) => (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={popoverOpen}
          className="w-full justify-between text-sm md:text-base"
        >
          {selectedValue ? selectedValue.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
        <Command>
          <CommandInput placeholder="Search race..." />
          <CommandList>
            <CommandEmpty>No race found.</CommandEmpty>
            <CommandGroup>
              {racesData.map((race) => (
                <CommandItem
                  key={race.id}
                  value={race.name} // Use name for searchability
                  onSelect={() => {
                    onSelectValue(race.id);
                    setPopoverOpen(false);
                  }}
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

  if (isLoadingRaces) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-slate-50">
        <p className="text-xl">Loading race data...</p>
      </div>
    );
  }

  if (isErrorRaces) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-slate-50">
        <div className="text-center">
          <p className="text-xl text-red-400">Error loading race data</p>
          <p className="text-slate-400">{(errorRaces as Error)?.message || 'An unknown error occurred.'}</p>
          <p className="text-slate-400 mt-2">Please check your internet connection or try again later.</p>
        </div>
      </div>
    );
  }
  
  if (!isLoadingRaces && !isErrorRaces && races.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-slate-50">
        <div className="text-center">
          <p className="text-xl">No Race Data Available</p>
          <p className="text-slate-400">The race data source might be empty, temporarily unavailable, or all data was invalid.</p>
           <p className="text-slate-400 mt-2">Please try again later or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-lg shadow-2xl bg-slate-800 border-slate-700 text-slate-50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">
            Race Time Predictor
          </CardTitle>
          <CardDescription className="text-slate-400">
            Estimate your time for a target race based on a past performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="past-race" className="block text-sm font-medium text-slate-300">
              Your Past Race
            </label>
            <RaceSelector
              popoverOpen={pastRacePopoverOpen}
              setPopoverOpen={setPastRacePopoverOpen}
              selectedValue={selectedPastRace}
              onSelectValue={setSelectedPastRaceId}
              placeholder="Select your past race"
              racesData={races}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="user-time" className="block text-sm font-medium text-slate-300">
              Your Time for Past Race (HH:MM or HH:MM:SS)
            </label>
            <Input
              id="user-time"
              type="text"
              placeholder="e.g., 03:45:30"
              value={userTimeInput}
              onChange={(e) => setUserTimeInput(e.target.value)}
              className="bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="target-race" className="block text-sm font-medium text-slate-300">
              Target Race
            </label>
            <RaceSelector
              popoverOpen={targetRacePopoverOpen}
              setPopoverOpen={setTargetRacePopoverOpen}
              selectedValue={selectedTargetRace}
              onSelectValue={setSelectedTargetRaceId}
              placeholder="Select your target race"
              racesData={races}
            />
          </div>

          <Button 
            onClick={handlePredictTime} 
            className="w-full bg-sky-500 hover:bg-sky-600 text-slate-50 font-semibold py-3 text-base"
            disabled={isLoadingRaces || races.length === 0} // Disable button if races are loading or empty
          >
            Predict My Time
          </Button>
        </CardContent>

        {predictedTime && (
          <CardFooter className="flex flex-col items-center justify-center pt-6 border-t border-slate-700">
            <p className="text-sm text-slate-400">Predicted Time for {selectedTargetRace?.name}:</p>
            <p className="text-4xl font-bold text-sky-400">{predictedTime}</p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default Index;
