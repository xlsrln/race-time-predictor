
import React from 'react';
import { PredictionResultDisplayRatios, PredictionResultUIRatios } from '@/types/ratiosPredictor'; // Updated import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Added Card imports for structure

interface PredictionResultRatiosProps extends PredictionResultUIRatios {} // Use the combined type

const PredictionResultRatios: React.FC<PredictionResultRatiosProps> = ({
  avg,
  median,
  winner,
  sourceRacesCount
}) => {
  const renderPredictionSection = (title: string, data: PredictionResultDisplayRatios | string | undefined, isPrimary: boolean = false) => {
    if (!data) return null; // Don't render if data is undefined

    if (typeof data === 'string') { // Error or info message
      return (
        <div className={`p-4 border rounded-lg bg-muted/50 dark:bg-muted/20 ${isPrimary ? 'mt-0' : 'mt-4'}`}>
          <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">{title}:</p>
          <p className={`${isPrimary ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'} font-bold text-center text-yellow-600 dark:text-yellow-500 py-2`}>{data}</p>
        </div>
      );
    }
    
    // Valid PredictionResultDisplayRatios object
    return (
      <div className={`p-4 border rounded-lg bg-muted/50 dark:bg-muted/20 ${isPrimary ? 'mt-0' : 'mt-4'}`}>
        <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">{title}:</p>
        <p className={`${isPrimary ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'} font-bold text-center text-primary dark:text-primary-foreground py-2`}>{data.time}</p>
        
        {sourceRacesCount > 1 && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 dark:border-border/30 mt-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground dark:text-gray-400">Min prediction:</p>
              <p className="text-base md:text-lg font-semibold text-primary/80 dark:text-primary-foreground/80">{data.min}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground dark:text-gray-400">Max prediction:</p>
              <p className="text-base md:text-lg font-semibold text-primary/80 dark:text-primary-foreground/80">{data.max}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!avg && !median && !winner) { // No results at all
    return null; 
  }

  return (
    <Card className="mt-6 bg-transparent border-none shadow-none">
      <CardHeader className="pb-2 pt-0 px-1">
        <CardTitle className="text-xl md:text-2xl">Prediction Results (Ratios)</CardTitle>
        <CardDescription>Based on historical race data comparisons.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 px-1">
        {renderPredictionSection("Avg. prediction (runners in common)", avg, true)}
        {median && renderPredictionSection("Median time based prediction", median)}
        {winner && renderPredictionSection("Winner time based prediction", winner)}
      </CardContent>
    </Card>
  );
};

export default PredictionResultRatios;
