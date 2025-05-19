
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added CardFooter
import { PredictionResultCsv as PredictionResultCsvType } from '@/types/csvPredictor';

interface PredictionResultCsvProps {
  result: PredictionResultCsvType | null;
  targetRaceName?: string;
}

const PredictionResultCsv: React.FC<PredictionResultCsvProps> = ({ result, targetRaceName }) => {
  if (!result) {
    return null;
  }

  return (
    <CardFooter className="flex flex-col items-center justify-center pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
        Predicted Time for {targetRaceName || "Target Race"}:
      </p>
      {result.count === 1 ? (
        <div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{result.average}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">(Based on 1 performance)</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center w-full">
          <div>
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wider">Min</p>
            <p className="text-2xl font-semibold text-blue-500 dark:text-blue-400">{result.min}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wider">Average</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{result.average}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wider">Max</p>
            <p className="text-2xl font-semibold text-blue-500 dark:text-blue-400">{result.max}</p>
          </div>
        </div>
      )}
       {result.count > 1 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">(Based on {result.count} performances)</p>}
    </CardFooter>
  );
};

export default PredictionResultCsv;
