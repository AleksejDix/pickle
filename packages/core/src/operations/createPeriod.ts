import type { Period, Unit, Temporal } from "../types";

/**
 * Create a period of a specific type from another period
 * Uses the period's date as the reference point
 */
export function createPeriod(
  temporal: Temporal,
  type: Unit,
  period: Period
): Period {
  const { adapter, weekStartsOn } = temporal;
  const date = period.date;

  if (type === "custom") {
    // For custom periods, just return the original period
    return period;
  }

  const start = adapter.startOf(date, type as Exclude<Unit, "custom">, {
    weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6,
  });
  const end = adapter.endOf(date, type as Exclude<Unit, "custom">, {
    weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6,
  });

  return {
    start,
    end,
    type,
    date,
  };
}
