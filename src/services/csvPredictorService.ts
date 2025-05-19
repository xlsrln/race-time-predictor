
import Papa from 'papaparse';
import { Race } from '@/types/race';
import { CsvRaceRow } from '@/types/csvPredictor';
import { parseCsvDurationToSeconds } from '@/lib/timeUtils';

export const CSV_URL = 'https://raw.githubusercontent.com/xlsrln/urtp/main/all_eu_wintimes.csv';

export const fetchAndProcessRaces = async (): Promise<Race[]> => {
  const response = await fetch(CSV_URL);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to fetch race data from CSV:', response.status, errorText);
    throw new Error(`Failed to fetch race data: ${response.status}`);
  }
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<CsvRaceRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn("CSV parsing errors encountered:", results.errors);
          // Optionally, you could reject here if errors are critical
          // reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
          // return;
        }
        
        const processedRaces = results.data
          .map((row, index) => {
            // Basic validation for essential fields
            if (!row.country || !row.event || !row.name || !row.dist_km || !row.year || !row.duration) {
              // console.warn(`Skipping row due to missing essential fields: ${JSON.stringify(row)} at original index ${index}`);
              return null; 
            }

            const distKmNum = parseFloat(row.dist_km);
            const yearNum = parseInt(row.year, 10);
            const winnerTimeSeconds = parseCsvDurationToSeconds(row.duration);

            if (isNaN(distKmNum) || distKmNum <= 0 || isNaN(yearNum) || winnerTimeSeconds === null || winnerTimeSeconds <= 0) {
              // console.warn(`Skipping row due to invalid numeric/time data: ${JSON.stringify(row)}`);
              return null;
            }

            return {
              id: `${row.country}-${row.event}-${row.year}-${index}`, // Ensure unique ID
              name: `${row.name} (${distKmNum}km, ${yearNum})`, // More descriptive name
              country: row.country,
              distKm: distKmNum,
              year: yearNum,
              winnerTimeSeconds: winnerTimeSeconds,
            };
          })
          .filter(race => race !== null) as Race[]; // Type assertion after filtering nulls
        
        if (processedRaces.length === 0 && results.data.length > 0) {
          console.warn("All CSV rows were filtered out after processing. Check data quality and parsing logic.");
        }
        resolve(processedRaces);
      },
      error: (error: Error) => {
        console.error("Papaparse critical error:", error);
        reject(new Error('Failed to parse CSV data due to a Papaparse error.'));
      }
    });
  });
};
