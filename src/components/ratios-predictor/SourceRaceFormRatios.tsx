
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { SourceRaceEntryRatios } from '@/types/ratiosPredictor';
import RaceSelector, { RaceSelectorItem } from '@/components/shared/RaceSelector';

interface SourceRaceFormRatiosProps {
  sourceRaces: SourceRaceEntryRatios[];
  raceSelectorItems: RaceSelectorItem[];
  updateSourceRace: (index: number, field: 'race' | 'time', value: string) => void;
  addSourceRace: () => void;
  removeSourceRace: (index: number) => void;
}

const SourceRaceFormRatios: React.FC<SourceRaceFormRatiosProps> = ({
  sourceRaces,
  raceSelectorItems,
  updateSourceRace,
  addSourceRace,
  removeSourceRace
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Races you've completed</h3>
      
      {sourceRaces.map((entry, index) => {
        const selectedRaceItem = entry.race ? raceSelectorItems.find(item => item.id === entry.race) : undefined;
        return (
          <div key={index} className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50 relative">
            <div className="flex justify-between items-center mb-1">
              <Label htmlFor={`sourceRaceRatios-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Source Race #{index + 1}
              </Label>
              {sourceRaces.length > 0 && ( // Keep > 0, as removeSourceRace might prevent it from being empty if it has a minimum of 1. If it can be 0, this is fine.
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeSourceRace(index)}
                  className="text-red-500 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-500/20 p-1 h-auto w-auto"
                  aria-label={`Remove race ${index + 1}`}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
              <div className="flex-1 min-w-0">
                <RaceSelector
                  selectedValue={selectedRaceItem}
                  onSelectValue={(value) => {
                    if (value !== null) {
                      updateSourceRace(index, 'race', value);
                    }
                  }}
                  placeholder="Select race"
                  items={raceSelectorItems}
                  disabled={raceSelectorItems.length === 0}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <Input 
                  id={`sourceTimeRatios-${index}`} 
                  placeholder="e.g., 03:45:30 (HH:MM:SS)"
                  value={entry.time} 
                  onChange={(e) => updateSourceRace(index, 'time', e.target.value)} 
                  className="w-full bg-white dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          </div>
        );
      })}
      <Button 
        type="button" 
        variant="outline" 
        onClick={addSourceRace}
        className="w-full mt-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400/20"
      >
        Add Another Race
      </Button>
    </div>
  );
};

export default SourceRaceFormRatios;
