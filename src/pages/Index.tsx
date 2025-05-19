
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Race } from '@/types/race';
import { timeToSeconds, secondsToHhMmSs, parseCsvDurationToSeconds } from '@/lib/timeUtils';
import { toast } from "sonner";

// Mock data - replace with CSV data later
const MOCK_RACES_RAW = [
  { country: "FRA", event: "1", name: "Paris Marathon", dist_km: 42.2, year: 2023, duration: "0 days 02:05:30" },
  { country: "GER", event: "2", name: "Berlin Marathon", dist_km: 42.2, year: 2023, duration: "0 days 02:01:09" },
  { country: "USA", event: "3", name: "Chicago Marathon", dist_km: 42.2, year: 2023, duration: "0 days 02:00:35" },
  { country: "GBR", event: "4", name: "London Marathon", dist_km: 42.2, year: 2023, duration: "0 days 02:01:25" },
  { country: "JPN", event: "5", name: "Tokyo Marathon", dist_km: 42.2, year: 2023, duration: "0 days 02:02:16" },
  { country: "FRA", event: "6", name: "Nice Half Marathon", dist_km: 21.1, year: 2023, duration: "0 days 01:00:00" },
  { country: "ESP", event: "7", name: "Valencia 10K", dist_km: 10, year: 2024, duration: "0 days 00:26:30" },
  { country: "SUI", event: "8", name: "UTMB", dist_km: 171, year: 2023, duration: "1 days 05:30:00" } // Example with >24h
];

const processRaces = (rawRaces: typeof MOCK_RACES_RAW): Race[] => {
  return rawRaces.map((race, index) => {
    const winnerTimeSeconds = parseCsvDurationToSeconds(race.duration);
    return {
      id: `${race.country}-${race.event}-${race.year}-${index}`, // Ensure unique ID
      name: `${race.name} (${race.dist_km}km, ${race.year})`,
      country: race.country,
      distKm: race.dist_km,
      year: race.year,
      winnerTimeSeconds: winnerTimeSeconds !== null ? winnerTimeSeconds : 0, // Handle potential parsing errors
    };
  }).filter(race => race.winnerTimeSeconds > 0); // Filter out races with invalid durations
};

const Index = () => {
  const [races, setRaces] = useState<Race[]>(() => processRaces(MOCK_RACES_RAW));
  const [selectedPastRaceId, setSelectedPastRaceId] = useState<string | null>(null);
  const [userTimeInput, setUserTimeInput] = useState<string>(''); // HH:MM format
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
    placeholder
  }: {
    popoverOpen: boolean;
    setPopoverOpen: (open: boolean) => void;
    selectedValue: Race | undefined;
    onSelectValue: (value: string | null) => void;
    placeholder: string;
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
              {races.map((race) => (
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
            />
          </div>

          <Button onClick={handlePredictTime} className="w-full bg-sky-500 hover:bg-sky-600 text-slate-50 font-semibold py-3 text-base">
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

