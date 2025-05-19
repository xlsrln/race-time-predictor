
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface SourceRaceEntry {
  race: string;
  time: string;
}

interface SourceRaceFormProps {
  sourceRaces: SourceRaceEntry[];
  raceNames: string[];
  updateSourceRace: (index: number, field: 'race' | 'time', value: string) => void;
  addSourceRace: () => void;
  removeSourceRace: (index: number) => void;
}

const SourceRaceForm: React.FC<SourceRaceFormProps> = ({
  sourceRaces,
  raceNames,
  updateSourceRace,
  addSourceRace,
  removeSourceRace
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Races you've completed</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addSourceRace}
        >
          Add Race
        </Button>
      </div>
      
      {sourceRaces.map((entry, index) => (
        <div key={index} className="flex space-x-2 items-end">
          <div className="w-1/2 space-y-2">
            <Label htmlFor={`sourceRace-${index}`}>Race</Label>
            <Select 
              value={entry.race} 
              onValueChange={(value) => updateSourceRace(index, 'race', value)}
            >
              <SelectTrigger id={`sourceRace-${index}`}>
                <SelectValue placeholder="Select race" />
              </SelectTrigger>
              <SelectContent>
                {raceNames.map((race) => (
                  <SelectItem key={`source-${index}-${race}`} value={race}>{race}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-1/2 space-y-2">
            <Label htmlFor={`sourceTime-${index}`}>Time (HH:MM)</Label>
            <Input 
              id={`sourceTime-${index}`} 
              placeholder="HH:MM" 
              value={entry.time} 
              onChange={(e) => updateSourceRace(index, 'time', e.target.value)} 
            />
          </div>
          
          {sourceRaces.length > 1 && (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              onClick={() => removeSourceRace(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default SourceRaceForm;
