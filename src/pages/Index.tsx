
import React, { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import RacePredictorRatiosContainer from '@/components/runner-in-common-predictor/RacePredictorRatiosContainer';
import CsvPredictorContainer from '@/components/simple-time-predictor/CsvPredictorContainer';

const Index = () => {
  const [activeMode, setActiveMode] = useState<'ratios' | 'csv'>('ratios');

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4 pt-8 md:pt-12">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800 dark:text-gray-100">
        Ultra Race Time Calculator
      </h1>
      
      {activeMode === 'csv' && <CsvPredictorContainer />}
      {activeMode === 'ratios' && <RacePredictorRatiosContainer />}

      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mt-8 mb-6">
        <ToggleGroup 
          type="single" 
          value={activeMode} 
          onValueChange={(value) => { if (value) setActiveMode(value as 'ratios' | 'csv'); }} 
          className="grid grid-cols-2 gap-1 border bg-muted p-1 rounded-md dark:bg-gray-700 dark:border-gray-600"
        >
          <ToggleGroupItem value="ratios" aria-label="Runner In Common Predictor" className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-md dark:data-[state=on]:bg-gray-500 dark:data-[state=on]:text-white">
            Runner In Common Predictor
          </ToggleGroupItem>
          <ToggleGroupItem value="csv" aria-label="Simple Time Predictor" className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-md dark:data-[state=on]:bg-gray-500 dark:data-[state=on]:text-white">
            Simple Time Predictor
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};

export default Index;
