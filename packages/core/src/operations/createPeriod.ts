import type { Period, PeriodType, TemporalContext } from "../types";

/**
 * Create a period of a specific type from another period
 * Uses the period's date as the reference point
 */
export function createPeriod(
  context: TemporalContext,
  type: PeriodType,
  period: Period
): Period {
  const { adapter, weekStartsOn } = context;
  const date = period.date;

  const start = adapter.startOf(date, type as any, {
    weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6,
  });
  const end = adapter.endOf(date, type as any, {
    weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6,
  });

  return {
    start,
    end,
    type,
    date,
  };
}
