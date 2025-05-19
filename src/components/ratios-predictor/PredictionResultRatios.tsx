
import React from 'react';
import { PredictionResultDisplayRatios, PredictionResultUIRatios } from '@/types/ratiosPredictor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface PredictionResultRatiosProps extends PredictionResultUIRatios {}

const PredictionResultRatios: React.FC<PredictionResultRatiosProps> = ({
  avg,
  median,
  winner,
  sourceRacesCount
}) => {
  const renderPredictionSection = (title: string, data: PredictionResultDisplayRatios | string | undefined, _isPrimary: boolean = false) => {
    if (!data) return null;

    const containerClasses = `p-4 border rounded-lg bg-muted/50 dark:bg-muted/20 mt-4`; // isPrimary mt-0 removed as CardHeader provides top spacing

    if (typeof data === 'string') { // Error or info message
      return (
        <div className={containerClasses}>
          <p className="text-sm font-medium text-muted-foreground dark:text-gray-400 text-center">{title}:</p>
          <p className={`text-xl md:text-2xl font-bold text-center text-yellow-600 dark:text-yellow-500 py-2`}>{data}</p>
        </div>
      );
    }
    
    // Valid PredictionResultDisplayRatios object
    return (
      <div className={containerClasses}>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-2">{title}</p>
        {sourceRacesCount === 1 || (!data.min && !data.max) ? ( // Show single time if only one source race or min/max are not meaningful for this section
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 text-center py-2">{data.time}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center w-full mt-2">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">MIN</p>
              <p className="text-2xl font-semibold text-blue-500 dark:text-blue-400">{data.min}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">AVERAGE</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{data.time}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">MAX</p>
              <p className="text-2xl font-semibold text-blue-500 dark:text-blue-400">{data.max}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!avg && !median && !winner) {
    return null; 
  }

  return (
    <Card className="mt-6 bg-transparent border-none shadow-none">
      <CardHeader className="pb-2 pt-0 px-1 text-center md:text-left">
        <CardTitle className="text-xl md:text-2xl">Prediction Results (Ratios)</CardTitle>
        <CardDescription>Based on historical race data comparisons.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 px-1"> {/* Reduced space-y slightly */}
        {renderPredictionSection("Avg. prediction (runners in common)", avg, true)}
        {median && renderPredictionSection("Median time based prediction", median)}
        {winner && renderPredictionSection("Winner time based prediction", winner)}
      </CardContent>
    </Card>
  );
};

export default PredictionResultRatios;
