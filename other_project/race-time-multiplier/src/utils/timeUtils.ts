
// Function to convert time string (HH:MM:SS, MM:SS, or HH:MM) to seconds
export function timeToSeconds(timeString: string): number {
  // Handle empty input
  if (!timeString) return 0;
  
  const parts = timeString.split(':').map(part => parseInt(part, 10));
  
  if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // Could be either MM:SS or HH:MM format
    // For simplicity in this context, we'll assume MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    // SS format
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
export function formatTimeString(timeString: string): string {
  // Handle empty input
  if (!timeString) return "00:00:00";
  
  const parts = timeString.split(':');
  
  if (parts.length === 3) {
    // Already in HH:MM:SS format, but ensure each part is zero-padded
    const [hours, minutes, seconds] = parts.map(part => 
      part.padStart(2, '0')
    );
    return `${hours}:${minutes}:${seconds}`;
  } else if (parts.length === 2) {
    // MM:SS format - add hours
    const [minutes, seconds] = parts.map(part => 
      part.padStart(2, '0')
    );
    return `00:${minutes}:${seconds}`;
  } else if (parts.length === 1) {
    // Just seconds
    return `00:00:${parts[0].padStart(2, '0')}`;
  }
  
  return "00:00:00";
}
