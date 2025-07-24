import type { Period } from "../types/period";

/**
 * Create a custom period with specific start and end dates
 */
export function createCustomPeriod(start: Date, end: Date): Period {
  return {
    start,
    end,
    type: "custom",
    value: new Date((start.getTime() + end.getTime()) / 2),
    number: 0,
  };
}
