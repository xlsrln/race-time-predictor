
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TargetRaceSelectorRatiosProps {
  targetRace: string;
  setTargetRace: (race: string) => void;
  raceNames: string[];
}

const TargetRaceSelectorRatios: React.FC<TargetRaceSelectorRatiosProps> = ({
  targetRace,
  setTargetRace,
  raceNames
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="targetRaceRatios" className="text-base font-semibold">Race you want to predict</Label>
      <Select 
        value={targetRace} 
        onValueChange={setTargetRace}
        disabled={raceNames.length === 0}
      >
        <SelectTrigger id="targetRaceRatios">
          <SelectValue placeholder="Select target race" />
        </SelectTrigger>
        <SelectContent>
          {raceNames.length > 0 ? raceNames.map((race) => (
            <SelectItem key={`targetRatios-${race}`} value={race}>{race}</SelectItem>
          )) : <SelectItem value="" disabled>No races loaded</SelectItem>}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TargetRaceSelectorRatios;
