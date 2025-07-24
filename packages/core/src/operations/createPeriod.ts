import type { Period, PeriodType, TemporalContext } from "../types/period";
import type { DivideUnit } from "../types/reactive";

/**
 * Create a period of a specific type at a given date
 */
export function createPeriod(
  context: TemporalContext,
  type: PeriodType,
  value: Date
): Period {
  const { adapter, weekStartsOn } = context;

  const start = adapter.startOf(value, type as any, {
    weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6,
  });
  const end = adapter.endOf(value, type as any, {
    weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6,
  });
  const number = getNumber(value, type, adapter);

  return {
    start,
    end,
    type,
    value,
    number,
  };
}

/**
 * Get the numeric value for a period type
 */
function getNumber(
  date: Date,
  type: PeriodType | DivideUnit,
  adapter: any
): number {
  switch (type) {
    case "year":
      return date.getFullYear();
    case "month":
    case "stableMonth":
      return date.getMonth() + 1;
    case "week":
      // Calculate week number
      const startOfYear = adapter.startOf(date, "year");
      const startOfWeek = adapter.startOf(date, "week");
      const daysDiff = Math.floor(
        (startOfWeek.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
      );
      return Math.floor(daysDiff / 7) + 1;
    case "day":
      return date.getDate();
    case "hour":
      return date.getHours();
    case "minute":
      return date.getMinutes();
    case "second":
      return date.getSeconds();
    case "quarter":
      return Math.floor(date.getMonth() / 3) + 1;
    default:
      return 0;
  }
}
