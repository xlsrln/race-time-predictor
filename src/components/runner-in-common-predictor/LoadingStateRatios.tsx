
import React from 'react';

interface LoadingStateRatiosProps {
  isLoading: boolean;
  error: string | null;
}

const LoadingStateRatios: React.FC<LoadingStateRatiosProps> = ({ isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <p className="ml-2 text-muted-foreground">Loading race data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center text-red-500 p-4 border border-red-500 bg-red-50 rounded-md">
        <p className="font-semibold">Error:</p>
        <p>{error}</p>
      </div>
    );
  }
  
  return null;
};

export default LoadingStateRatios;
