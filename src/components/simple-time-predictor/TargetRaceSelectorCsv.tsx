
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
      <label htmlFor="target-race-csv" className="text-base font-semibold">Race you want to predict</Label>
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
