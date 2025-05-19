
import React from 'react';

interface PredictionResultData {
  time: string;
  min: string;
  max: string;
}

interface PredictionResultProps {
  avg: PredictionResultData | string;
  median?: PredictionResultData;
  winner?: PredictionResultData;
  sourceRacesCount: number;
}

const PredictionResult: React.FC<PredictionResultProps> = ({
  avg,
  median,
  winner,
  sourceRacesCount
}) => {
  const renderPredictionSection = (title: string, data: PredictionResultData | string, isPrimary: boolean = false) => {
    // Handle case when data is a string (error message)
    if (typeof data === 'string') {
      return (
        <div className={`p-4 border rounded-lg bg-muted/50 space-y-2 ${isPrimary ? '' : 'mt-4'}`}>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}:</p>
            <p className={`${isPrimary ? 'text-3xl' : 'text-2xl'} font-bold text-center text-yellow-600`}>{data}</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className={`p-4 border rounded-lg bg-muted/50 space-y-2 ${isPrimary ? '' : 'mt-4'}`}>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}:</p>
          <p className={`${isPrimary ? 'text-3xl' : 'text-2xl'} font-bold text-center`}>{data.time}</p>
        </div>
        
        {sourceRacesCount > 1 && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Min prediction:</p>
              <p className="text-lg font-semibold">{data.min}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Max prediction:</p>
              <p className="text-lg font-semibold">{data.max}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-4">
      {renderPredictionSection("Prediction based on runners in common", avg, true)}
      
      {median && renderPredictionSection("Prediction based on median times", median)}
      
      {winner && renderPredictionSection("Prediction based on winner times", winner)}
    </div>
  );
};

export default PredictionResult;
