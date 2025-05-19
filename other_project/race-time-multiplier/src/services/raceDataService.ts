
import { timeToSeconds, secondsToTime, formatTimeString } from '../utils/timeUtils';

export interface RaceRatio {
  source: string;
  target: string;
  ratioAvg: number | null;
  ratioMedian?: number | null;
  ratioWinner?: number | null;
}

let raceRatios: RaceRatio[] = [];
let raceNames: string[] = [];

export async function fetchRaceData(): Promise<void> {
  try {
    const response = await fetch('https://raw.githubusercontent.com/xlsrln/urtp/main/combined_ratios.csv');
    if (!response.ok) {
      throw new Error('Failed to fetch race data');
    }
    
    const csvText = await response.text();
    parseRaceData(csvText);
    
    console.log('Race data loaded successfully', { races: raceNames.length, ratios: raceRatios.length });
  } catch (error) {
    console.error('Error loading race data:', error);
    throw error;
  }
}

function parseRaceData(csvText: string): void {
  const lines = csvText.split('\n');
  if (lines.length < 2) return;

  // Parse header to find column indexes - trim to handle any whitespace
  const header = lines[0].split(',').map(h => h.trim());
  
  // Map the new column names to our expected ones
  const sourceIndex = header.indexOf('event1');
  const targetIndex = header.indexOf('event2');
  const ratioWinnerIndex = header.indexOf('ratio_winner');
  const ratioMedianIndex = header.indexOf('ratio_median');
  const ratioAvgIndex = header.indexOf('ratio_avg');
  
  console.log('CSV headers parsed:', { 
    header, 
    sourceIndex, 
    targetIndex, 
    ratioAvgIndex, 
    ratioMedianIndex, 
    ratioWinnerIndex 
  });
  
  if (sourceIndex === -1 || targetIndex === -1) {
    console.error('CSV format is invalid, missing required event1/event2 columns', { header });
    return;
  }
  
  const uniqueRaces = new Set<string>();
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => v.trim());
    if (values.length < Math.max(sourceIndex, targetIndex) + 1) continue;
    
    const sourceRace = values[sourceIndex];
    const targetRace = values[targetIndex];
    
    // Skip empty values for required fields
    if (!sourceRace || !targetRace) continue;
    
    // Add races to unique set
    uniqueRaces.add(sourceRace);
    uniqueRaces.add(targetRace);
    
    // Create ratio object with potentially null ratios
    const ratio: RaceRatio = {
      source: sourceRace,
      target: targetRace,
      ratioAvg: null
    };
    
    // Add ratioAvg if it exists and is not empty
    if (ratioAvgIndex !== -1 && ratioAvgIndex < values.length) {
      const ratioAvgStr = values[ratioAvgIndex];
      if (ratioAvgStr && ratioAvgStr.trim() !== '') {
        const ratioAvg = parseFloat(ratioAvgStr);
        ratio.ratioAvg = !isNaN(ratioAvg) ? ratioAvg : null;
      }
    }
    
    // Add optional ratios if they exist and are not empty
    if (ratioMedianIndex !== -1 && ratioMedianIndex < values.length) {
      const ratioMedianStr = values[ratioMedianIndex];
      if (ratioMedianStr && ratioMedianStr.trim() !== '') {
        const ratioMedian = parseFloat(ratioMedianStr);
        ratio.ratioMedian = !isNaN(ratioMedian) ? ratioMedian : null;
      } else {
        ratio.ratioMedian = null;
      }
    }
    
    if (ratioWinnerIndex !== -1 && ratioWinnerIndex < values.length) {
      const ratioWinnerStr = values[ratioWinnerIndex];
      if (ratioWinnerStr && ratioWinnerStr.trim() !== '') {
        const ratioWinner = parseFloat(ratioWinnerStr);
        ratio.ratioWinner = !isNaN(ratioWinner) ? ratioWinner : null;
      } else {
        ratio.ratioWinner = null;
      }
    }
    
    raceRatios.push(ratio);
  }
  
  // Convert set to sorted array
  raceNames = Array.from(uniqueRaces).sort();
}

export function getRaceNames(): string[] {
  return raceNames;
}

export function findRatio(sourceRace: string, targetRace: string): RaceRatio | null {
  const ratio = raceRatios.find(r => 
    r.source === sourceRace && r.target === targetRace
  );
  
  return ratio || null;
}

export interface PredictionResult {
  avg: string;
  median?: string;
  winner?: string;
}

export function predictTime(sourceTime: string, sourceRace: string, targetRace: string): PredictionResult {
  // If same race, return source time with proper formatting for all types
  if (sourceRace === targetRace) {
    const formattedTime = secondsToTime(timeToSeconds(sourceTime));
    return {
      avg: formattedTime,
      median: formattedTime,
      winner: formattedTime
    };
  }
  
  const ratio = findRatio(sourceRace, targetRace);
  if (!ratio) return { avg: "No data available" };
  
  const secondsSource = timeToSeconds(sourceTime);
  if (secondsSource <= 0) return { avg: "00:00:00" };
  
  const result: PredictionResult = {
    avg: ratio.ratioAvg === null ? "No runners in common" : secondsToTime(secondsSource / ratio.ratioAvg)
  };
  
  if (ratio.ratioMedian !== null && ratio.ratioMedian !== undefined) {
    result.median = secondsToTime(secondsSource / ratio.ratioMedian);
  }
  
  if (ratio.ratioWinner !== null && ratio.ratioWinner !== undefined) {
    result.winner = secondsToTime(secondsSource / ratio.ratioWinner);
  }
  
  return result;
}
