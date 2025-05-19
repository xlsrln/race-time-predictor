
// Function to convert time string (HH:MM:SS, MM:SS, or HH:MM) to seconds
export function timeToSeconds(timeString: string): number {
  // Handle empty input
  if (!timeString) return 0;
  
  const parts = timeString.split(':').map(part => parseInt(part, 10));
  
  if (parts.some(isNaN)) return 0; // Added check for NaN parts

  if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // Could be either MM:SS or HH:MM format
    // For this context (from original project), it's usually HH:MM from input, then :00 added
    // If direct MM:SS intended, ensure this logic is fine
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    // SS format (unlikely from original input, but included for robustness)
    return parts[0];
  }
  
  return 0;
}

// Function to convert seconds to time string (HH:MM:SS)
export function secondsToTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
}

// Function to ensure a time string is in HH:MM:SS format
// This was in original, but may not be strictly needed if inputs are already handled
export function formatTimeString(timeString: string): string {
  // Handle empty input
  if (!timeString) return "00:00:00";
  
  const parts = timeString.split(':');
  
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts.map(part => 
      part.padStart(2, '0')
    );
    return `${hours}:${minutes}:${seconds}`;
  } else if (parts.length === 2) {
    const [minutes, seconds] = parts.map(part => 
      part.padStart(2, '0')
    );
    return `00:${minutes}:${seconds}`;
  } else if (parts.length === 1) {
    return `00:00:${parts[0].padStart(2, '0')}`;
  }
  
  return "00:00:00";
}
