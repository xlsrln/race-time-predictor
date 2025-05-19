
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Removed Label import as it's no longer used directly in the new layout
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Races you've completed</h3>
        <Button
          type="button"
          variant="outline"
          onClick={addSourceRace}
          className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400/20 px-3 py-1 text-sm"
        >
          Add Race
        </Button>
      </div>
      
      {sourceRaces.map((entry, index) => {
        const selectedRaceItem = entry.race ? raceSelectorItems.find(item => item.id === entry.race) : undefined;
        return (
          <div key={index} className="flex items-center space-x-2 mb-3">
            <div className="flex-1 min-w-0">
              <RaceSelector
                selectedValue={selectedRaceItem}
                onSelectValue={(value) => {
                  if (value !== null) {
                    updateSourceRace(index, 'race', value);
                  }
                }}
                placeholder={`Source Race #${index + 1}`}
                items={raceSelectorItems}
                disabled={raceSelectorItems.length === 0}
              />
            </div>
            
            <div className="flex-none w-40 min-w-0">
              <Input 
                id={`sourceTimeRatios-${index}`} 
                placeholder="HH:MM:SS"
                value={entry.time} 
                onChange={(e) => updateSourceRace(index, 'time', e.target.value)} 
                className="w-full bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
              />
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={() => removeSourceRace(index)}
              className="text-red-500 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-500/20 p-1"
              aria-label={`Remove race ${index + 1}`}
            >
              <X size={18} />
            </Button>
          </div>
        );
      })}
      {/* The "Add Another Race" button was moved up, so this original position is removed. 
          If sourceRaces can be empty and we want a prominent "Add Race" button initially, 
          we might need a different strategy, but for now, it's consistent with CsvPredictor. */}
    </div>
  );
};

export default SourceRaceFormRatios;

