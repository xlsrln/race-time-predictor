
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PredictionResultDataRatios } from '@/types/ratiosPredictor'; // Updated import

interface PredictionResultRatiosProps {
  prediction: PredictionResultDataRatios | null;
  targetRaceName?: string; // Optional: if you want to display the target race name here
}

const PredictionResultRatios: React.FC<PredictionResultRatiosProps> = ({ prediction, targetRaceName }) => {
  if (!prediction) {
    return null;
  }

  const { avg, median, winner, sourceRacesCount } = prediction;

  return (
    <Card className="mt-6 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Prediction Result
          {targetRaceName && <span className="text-base font-normal text-gray-600 dark:text-gray-300"> for {targetRaceName}</span>}
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
          Based on {sourceRacesCount} source race(s).
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wider">Average Time</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{avg}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wider">Median Time</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{median}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wider">Predicted Winner Time</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{winner}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionResultRatios;
