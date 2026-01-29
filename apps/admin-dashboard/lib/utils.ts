import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mapError(error: string) {
  switch (error) {
    case "Invalid credentials":
      return "Noto'g'ri elektron pochta yoki parol";
    default:
      return error;
  }
}

/**
 * Formats minutes into a human-readable duration string in Uzbek
 * @param minutes - Total minutes (e.g., 125)
 * @returns Formatted string (e.g., "2 soat 5 daqiqa" or "30 daqiqa")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} daqiqa`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} soat`;
  }

  return `${hours} soat ${remainingMinutes} daqiqa`;
}

export function getTokenClient() {
  console.log("window:", document.cookie.split("; "));
  return window && document
    ? document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]
    : undefined;
}
