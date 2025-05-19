
import React from 'react';
import { Card, CardContent, CardHeader, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import GenericSourceRacesForm, { GenericSourceRacesFormProps } from './GenericSourceRacesForm'; // Ensure correct path

interface PredictorLayoutProps {
  pageDescription: React.ReactNode;
  
  isLoadingInitialData: boolean;
  initialDataError?: any; // Using any for broader compatibility with error types from hooks
  initialDataLoadingMessage?: string;
  initialDataErrorMessage?: string;
  noDataAvailableMessage?: string;
  
  sourceRacesFormProps: GenericSourceRacesFormProps;
  
  TargetRaceSelectorComponent: React.ReactNode;
  
  onPredict: () => void;
  predictButtonText: string;
  isPredictButtonDisabled: boolean;
  
  additionalBadges?: React.ReactNode;
  PredictionResultComponent?: React.ReactNode;
  
  footerPrimaryText: string;
  footerSecondaryText: string;
}

const PredictorLayout: React.FC<PredictorLayoutProps> = ({
  pageDescription,
  isLoadingInitialData,
  initialDataError,
  initialDataLoadingMessage = "Loading race data...",
  initialDataErrorMessage = "Could not load initial race data. Please check your connection or try refreshing.",
  noDataAvailableMessage = "No race data available.",
  sourceRacesFormProps,
  TargetRaceSelectorComponent,
  onPredict,
  predictButtonText,
  isPredictButtonDisabled,
  additionalBadges,
  PredictionResultComponent,
  footerPrimaryText,
  footerSecondaryText,
}) => {
  
  const showContent = !isLoadingInitialData && !initialDataError;
  const showNoDataMessage = !isLoadingInitialData && !initialDataError && sourceRacesFormProps.raceSelectorItems.length === 0;

  return (
    <Card className="w-full max-w-3xl shadow-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardDescription className="text-center text-gray-600 dark:text-gray-400">
          {pageDescription}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 p-4 md:p-6">
        {isLoadingInitialData && (
          <div className="flex flex-col items-center justify-center text-gray-800 dark:text-gray-200 p-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-2"></div>
            <p className="text-xl">{initialDataLoadingMessage}</p>
          </div>
        )}

        {initialDataError && (
          <div className="text-center p-4 text-red-600 dark:text-red-400">
            <p className="text-xl">Error Loading Data</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {(initialDataError as Error)?.message || initialDataErrorMessage}
            </p>
          </div>
        )}

        {showNoDataMessage && (
           <div className="text-center p-4 text-gray-700 dark:text-gray-300">
              <p className="text-xl">{noDataAvailableMessage}</p>
           </div>
        )}
        
        {showContent && !showNoDataMessage && (
          <>
            <GenericSourceRacesForm {...sourceRacesFormProps} />
            
            <div className="flex items-center justify-center my-4">
              <ArrowRight className="h-6 w-6 text-muted-foreground dark:text-gray-500" />
            </div>
            
            {TargetRaceSelectorComponent}
            
            <Button 
              className="w-full mt-6 py-3 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600" 
              onClick={onPredict}
              disabled={isPredictButtonDisabled}
            >
              {predictButtonText}
            </Button>
            
            {additionalBadges && (
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {additionalBadges}
              </div>
            )}
            
            {PredictionResultComponent}
          </>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-center text-muted-foreground dark:text-gray-500 flex flex-col justify-center gap-2 py-4 border-t dark:border-gray-700">
        <p>{footerPrimaryText}</p>
        <p className="pt-2 text-xs font-medium">{footerSecondaryText}</p>
      </CardFooter>
    </Card>
  );
};

export default PredictorLayout;
