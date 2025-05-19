
import React from 'react';

interface LoadingStateProps {
  isLoading: boolean;
  error: string | null;
}

const LoadingState: React.FC<LoadingStateProps> = ({ isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center text-red-500">{error}</div>
    );
  }
  
  return null;
};

export default LoadingState;
