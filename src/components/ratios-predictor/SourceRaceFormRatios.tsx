
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
import { X } from "lucide-react"; // Changed from Trash2 to X
import { SourceRaceEntryRatios } from '@/types/ratiosPredictor';

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
        <Label className="text-lg font-medium text-gray-800 dark:text-gray-200">Races you've completed</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addSourceRace}
          className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400/20"
        >
          Add Race
        </Button>
      </div>
      
      {sourceRaces.map((entry, index) => (
        <div key={index} className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50 relative">
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor={`sourceRaceRatios-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Source Race #{index + 1}
            </Label>
            {sourceRaces.length > 0 && ( // Show remove if any items
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => removeSourceRace(index)}
                className="text-red-500 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-500/20 p-1 h-auto w-auto"
                aria-label={`Remove race ${index + 1}`}
              >
                <X size={16} /> {/* Standardized icon */}
              </Button>
            )}
          </div>
          
          <div className="space-y-1"> {/* Group Select and Input for better structure if needed, or keep flat */}
            <Select 
              value={entry.race} 
              onValueChange={(value) => updateSourceRace(index, 'race', value)}
              disabled={raceNames.length === 0}
            >
              <SelectTrigger id={`sourceRaceRatios-${index}`} className="w-full bg-white dark:bg-gray-700 dark:border-gray-600">
                <SelectValue placeholder="Select race" />
              </SelectTrigger>
              <SelectContent>
                {raceNames.length > 0 ? raceNames.map((race) => (
                  <SelectItem key={`sourceRatios-${index}-${race}`} value={race}>{race}</SelectItem>
                )) : <SelectItem value="" disabled>No races loaded</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Input 
              id={`sourceTimeRatios-${index}`} 
              placeholder="e.g., 03:45 (HH:MM)" 
              value={entry.time} 
              onChange={(e) => updateSourceRace(index, 'time', e.target.value)} 
              className="w-full bg-white dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SourceRaceFormRatios;

