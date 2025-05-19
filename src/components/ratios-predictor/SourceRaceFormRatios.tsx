
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
import { SourceRaceEntryRatios } from '@/types/ratiosPredictor'; // Updated import

interface SourceRaceFormRatiosProps {
  sourceRaces: SourceRaceEntryRatios[];
  raceNames: string[];
  updateSourceRace: (index: number, field: 'race' | 'time', value: string) => void;
  addSourceRace: () => void;
  removeSourceRace: (index: number) => void;
}

const SourceRaceFormRatios: React.FC<SourceRaceFormRatiosProps> = ({
  sourceRaces,
  raceNames,
  updateSourceRace,
  addSourceRace,
  removeSourceRace
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">Races you've completed</Label>
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
        <div key={index} className="flex space-x-2 items-end p-3 border rounded-md bg-slate-50 dark:bg-slate-800">
          <div className="flex-grow space-y-1">
            <Label htmlFor={`sourceRaceRatios-${index}`} className="text-xs">Race #{index + 1}</Label>
            <Select 
              value={entry.race} 
              onValueChange={(value) => updateSourceRace(index, 'race', value)}
              disabled={raceNames.length === 0}
            >
              <SelectTrigger id={`sourceRaceRatios-${index}`}>
                <SelectValue placeholder="Select race" />
              </SelectTrigger>
              <SelectContent>
                {raceNames.length > 0 ? raceNames.map((race) => (
                  <SelectItem key={`sourceRatios-${index}-${race}`} value={race}>{race}</SelectItem>
                )) : <SelectItem value="" disabled>No races loaded</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-grow space-y-1">
            <Label htmlFor={`sourceTimeRatios-${index}`} className="text-xs">Time (HH:MM)</Label>
            <Input 
              id={`sourceTimeRatios-${index}`} 
              placeholder="e.g., 03:45" 
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
              className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
              aria-label={`Remove race ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default SourceRaceFormRatios;
