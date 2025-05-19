
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TargetRaceSelectorProps {
  targetRace: string;
  setTargetRace: (race: string) => void;
  raceNames: string[];
}

const TargetRaceSelector: React.FC<TargetRaceSelectorProps> = ({
  targetRace,
  setTargetRace,
  raceNames
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="targetRace">Race you want to predict</Label>
      <Select value={targetRace} onValueChange={setTargetRace}>
        <SelectTrigger id="targetRace">
          <SelectValue placeholder="Select race" />
        </SelectTrigger>
        <SelectContent>
          {raceNames.map((race) => (
            <SelectItem key={`target-${race}`} value={race}>{race}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TargetRaceSelector;
