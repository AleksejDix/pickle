import type { Period } from "../types";

/**
 * Split a period at a specific date
 */
export function split(
  period: Period,
  splitDate: Date
): [Period, Period] {
  const splitTime = splitDate.getTime();
  const startTime = period.start.getTime();
  const endTime = period.end.getTime();

  // Handle edge cases
  if (splitTime <= startTime) {
    // Split is at or before start - first part is empty
    return [
      {
        start: period.start,
        end: period.start,
        type: period.type,
        date: period.start,
      },
      period,
    ];
  }

  if (splitTime >= endTime) {
    // Split is at or after end - second part is empty
    return [
      period,
      {
        start: period.end,
        end: period.end,
        type: period.type,
        date: period.end,
      },
    ];
  }

  // Normal split
  const before: Period = {
    start: period.start,
    end: new Date(splitTime - 1), // End just before split point
    type: period.type,
    date: period.date,
  };

  const after: Period = {
    start: splitDate,
    end: period.end,
    type: period.type,
    date: splitDate,
  };

  return [before, after];
}