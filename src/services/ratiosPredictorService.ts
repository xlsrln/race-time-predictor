
import { timeToSeconds as timeToSecondsRatios, secondsToTime as secondsToTimeRatios } from '@/lib/timeUtilsRatios'; // Renamed import

export interface RaceRatio {
  source: string;
  target: string;
  ratioAvg: number | null;
  ratioMedian?: number | null;
  ratioWinner?: number | null;
}

let raceRatios: RaceRatio[] = [];
let raceNames: string[] = [];

export async function fetchRaceDataRatios(): Promise<void> { // Renamed function
  try {
    // Reset data on each fetch to prevent duplication if called multiple times
    raceRatios = [];
    raceNames = [];
    const response = await fetch('https://raw.githubusercontent.com/xlsrln/urtp/main/combined_ratios.csv');
    if (!response.ok) {
      throw new Error('Failed to fetch race ratios data');
    }
    
    const csvText = await response.text();
    parseRaceDataRatios(csvText); // Renamed function
    
    console.log('Race ratios data loaded successfully', { races: raceNames.length, ratios: raceRatios.length });
  } catch (error) {
    console.error('Error loading race ratios data:', error);
    throw error;
  }
}

function parseRaceDataRatios(csvText: string): void { // Renamed function
  const lines = csvText.split('\n');
  if (lines.length < 2) return;

  const header = lines[0].split(',').map(h => h.trim());
  
  const sourceIndex = header.indexOf('event1');
  const targetIndex = header.indexOf('event2');
  const ratioWinnerIndex = header.indexOf('ratio_winner');
  const ratioMedianIndex = header.indexOf('ratio_median');
  const ratioAvgIndex = header.indexOf('ratio_avg');
  
  console.log('CSV (Ratios) headers parsed:', { 
    header, 
    sourceIndex, 
    targetIndex, 
    ratioAvgIndex, 
    ratioMedianIndex, 
    ratioWinnerIndex 
  });
  
  if (sourceIndex === -1 || targetIndex === -1) {
    console.error('Ratios CSV format is invalid, missing required event1/event2 columns', { header });
    return;
  }
  
  const uniqueRaces = new Set<string>();
  const localRaceRatios: RaceRatio[] = []; // Use a local variable
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => v.trim());
    if (values.length < Math.max(sourceIndex, targetIndex) + 1) continue;
    
    const sourceRace = values[sourceIndex];
    const targetRace = values[targetIndex];
    
    if (!sourceRace || !targetRace) continue;
    
    uniqueRaces.add(sourceRace);
    uniqueRaces.add(targetRace);
    
    const ratio: RaceRatio = {
      source: sourceRace,
      target: targetRace,
      ratioAvg: null
    };
    
    if (ratioAvgIndex !== -1 && ratioAvgIndex < values.length) {
      const ratioAvgStr = values[ratioAvgIndex];
      if (ratioAvgStr && ratioAvgStr.trim() !== '') {
        const ratioAvg = parseFloat(ratioAvgStr);
        ratio.ratioAvg = !isNaN(ratioAvg) ? ratioAvg : null;
      }
    }
    
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
    
    localRaceRatios.push(ratio);
  }
  
  raceRatios = localRaceRatios; // Assign to module-level variable
  raceNames = Array.from(uniqueRaces).sort();
}

export function getRaceNamesRatios(): string[] { // Renamed function
  return raceNames;
}

export function findRatioRatios(sourceRace: string, targetRace: string): RaceRatio | null { // Renamed function
  const ratio = raceRatios.find(r => 
    r.source === sourceRace && r.target === targetRace
  );
  
  return ratio || null;
}

export interface PredictionResultRatiosDTO { // Renamed interface
  avg: string;
  median?: string;
  winner?: string;
}

export function predictTimeRatios(sourceTime: string, sourceRace: string, targetRace: string): PredictionResultRatiosDTO { // Renamed function
  if (sourceRace === targetRace) {
    const formattedTime = secondsToTimeRatios(timeToSecondsRatios(sourceTime));
    return {
      avg: formattedTime,
      median: formattedTime,
      winner: formattedTime
    };
  }
  
  const ratio = findRatioRatios(sourceRace, targetRace); // Use renamed function
  if (!ratio) return { avg: "No data available" };
  
  const secondsSource = timeToSecondsRatios(sourceTime);
  if (secondsSource <= 0) return { avg: "00:00:00" }; // Or some other default/error
  
  const result: PredictionResultRatiosDTO = {
    avg: ratio.ratioAvg === null ? "No runners in common" : secondsToTimeRatios(secondsSource / ratio.ratioAvg)
  };
  
  if (ratio.ratioMedian !== null && ratio.ratioMedian !== undefined) {
    result.median = secondsToTimeRatios(secondsSource / ratio.ratioMedian);
  }
  
  if (ratio.ratioWinner !== null && ratio.ratioWinner !== undefined) {
    result.winner = secondsToTimeRatios(secondsSource / ratio.ratioWinner);
  }
  
  return result;
}
