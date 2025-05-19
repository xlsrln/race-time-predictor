
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PredictionResultDataRatios } from '@/types/ratiosPredictor';

interface PredictionResultRatiosProps {
  prediction: PredictionResultDataRatios | null;
  targetRaceName?: string;
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
          {sourceRacesCount > 0 
            ? `Based on ${sourceRacesCount} source race(s) contributing to the prediction.`
            : "No source races contributed to a valid prediction."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center pt-4">
        <div>
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wider">Prediction</p>
          <p className={`text-2xl font-bold ${avg === "No runners in common" || avg === "N/A" ? "text-gray-500 dark:text-gray-400 text-lg" : "text-indigo-600 dark:text-indigo-400"}`}>{avg}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wider">Prediction based on median times</p>
          <p className={`text-2xl font-bold ${median === "N/A" ? "text-gray-500 dark:text-gray-400 text-lg" : "text-indigo-600 dark:text-indigo-400"}`}>{median}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wider">Prediction based on winner times</p>
          <p className={`text-2xl font-bold ${winner === "N/A" ? "text-gray-500 dark:text-gray-400 text-lg" : "text-indigo-600 dark:text-indigo-400"}`}>{winner}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionResultRatios;
