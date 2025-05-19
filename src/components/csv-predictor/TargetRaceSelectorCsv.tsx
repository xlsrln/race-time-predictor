
import React from 'react';
import RaceSelector, { RaceSelectorItem } from '@/components/shared/RaceSelector';

interface TargetRaceSelectorCsvProps {
  selectedValueId: string | null;
  onSelectValue: (value: string | null) => void;
  items: RaceSelectorItem[];
  disabled?: boolean;
  isLoading?: boolean; 
}

const TargetRaceSelectorCsv: React.FC<TargetRaceSelectorCsvProps> = ({
  selectedValueId,
  onSelectValue,
  items,
  disabled = false,
  isLoading = false,
}) => {
  const selectedValue = selectedValueId ? items.find(item => item.id === selectedValueId) : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor="target-race-csv" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Target Race (Winner Time Model)
      </label>
      <RaceSelector
        selectedValue={selectedValue}
        onSelectValue={onSelectValue}
        placeholder="Select your target race"
        items={items}
        disabled={disabled || isLoading || items.length === 0}
      />
    </div>
  );
};

export default TargetRaceSelectorCsv;
