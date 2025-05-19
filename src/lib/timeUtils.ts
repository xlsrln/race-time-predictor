
/**
 * Converts time string "HH:MM" or "HH:MM:SS" to total seconds.
 * Returns null if the format is invalid.
 */
export const timeToSeconds = (timeStr: string): number | null => {
  const parts = timeStr.split(':');
  if (parts.length < 2 || parts.length > 3) return null;

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parts.length === 3 ? parseInt(parts[2], 10) : 0;

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
  if (hours < 0 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) return null;

  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Converts total seconds to "HH:MM:SS" format.
 */
export const secondsToHhMmSs = (totalSeconds: number): string => {
  if (totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

/**
 * Parses duration string like "X days HH:MM:SS" or "HH:MM:SS" to seconds.
 * Example "0 days 05:49:37" or "05:49:37".
 */
export const parseCsvDurationToSeconds = (durationStr: string): number | null => {
  let timePart = durationStr;
  if (durationStr.includes("days")) {
    const parts = durationStr.split("days");
    if (parts.length > 1) {
      timePart = parts[1].trim();
    } else {
      // Malformed "days" string, try to parse whole string as time
      timePart = durationStr.trim();
    }
  }

  return timeToSeconds(timePart);
};

/**
 * Validates if a time string is in "HH:MM" or "HH:MM:SS" format.
 */
export const validateHhMmSs = (timeStr: string): boolean => {
  return timeToSeconds(timeStr) !== null;
};
