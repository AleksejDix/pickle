import type { Period } from "../types";

/**
 * Create a custom period with specific start and end dates
 */
export function createCustomPeriod(start: Date, end: Date): Period {
  return {
    start,
    end,
    type: "custom",
    date: new Date((start.getTime() + end.getTime()) / 2),
  };
}
