
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import RaceSelector, { RaceSelectorItem } from '@/components/shared/RaceSelector';

export interface GenericRaceEntry {
  id: string;
  raceId: string | null;
  time: string;
}

export interface GenericSourceRacesFormProps { // Ensured export
  formTitle: string;
  entries: GenericRaceEntry[];
  raceSelectorItems: RaceSelectorItem[];
  onUpdateEntryRace: (entryId: string, raceId: string | null) => void;
  onUpdateEntryTime: (entryId: string, time: string) => void;
  onAddEntry: () => void;
  onRemoveEntry: (entryId: string) => void;
  racePlaceholderPrefix?: string;
  isLoading?: boolean;
  timeInputPlaceholder?: string;
}

const GenericSourceRacesForm: React.FC<GenericSourceRacesFormProps> = ({
  formTitle,
  entries,
  raceSelectorItems,
  onUpdateEntryRace,
  onUpdateEntryTime,
  onAddEntry,
  onRemoveEntry,
  racePlaceholderPrefix = "Source Race",
  isLoading = false,
  timeInputPlaceholder = "HH:MM:SS",
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">{formTitle}</h3>
        <Button
          type="button"
          variant="outline"
          onClick={onAddEntry}
          className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400/20 px-3 py-1 text-sm"
          disabled={isLoading}
        >
          Add Race
        </Button>
      </div>
      
      {entries.map((entry, index) => {
        const selectedRaceItem = entry.raceId ? raceSelectorItems.find(item => item.id === entry.raceId) : undefined;
        return (
          <div key={entry.id} className="flex items-center space-x-2 mb-3">
            <div className="flex-1 min-w-0">
              <RaceSelector
                selectedValue={selectedRaceItem}
                onSelectValue={(value) => onUpdateEntryRace(entry.id, value)}
                placeholder={`${racePlaceholderPrefix} #${index + 1}`}
                items={raceSelectorItems}
                disabled={isLoading || raceSelectorItems.length === 0}
              />
            </div>
            
            <div className="flex-none w-40 min-w-0">
              <Input 
                id={`sourceTime-${entry.id}`} 
                placeholder={timeInputPlaceholder}
                value={entry.time} 
                onChange={(e) => onUpdateEntryTime(entry.id, e.target.value)} 
                className="w-full bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                disabled={isLoading}
              />
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={() => onRemoveEntry(entry.id)}
              className="text-red-500 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-500/20 p-1"
              aria-label={`Remove ${racePlaceholderPrefix.toLowerCase()} ${index + 1}`}
              disabled={isLoading}
            >
              <X size={18} />
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export default GenericSourceRacesForm;
