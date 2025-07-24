import type { Period } from "../types/period";

/**
 * Check if a period contains a date or another period
 */
export function contains(period: Period, target: Date | Period): boolean {
  if (target instanceof Date) {
    const targetTime = target.getTime();
    const startTime = period.start.getTime();
    const endTime = period.end.getTime();
    return targetTime >= startTime && targetTime <= endTime;
  } else {
    // Check if target period is fully contained
    const targetStart = target.start.getTime();
    const targetEnd = target.end.getTime();
    const thisStart = period.start.getTime();
    const thisEnd = period.end.getTime();

    return targetStart >= thisStart && targetEnd <= thisEnd;
  }
}
