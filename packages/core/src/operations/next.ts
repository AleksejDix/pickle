import type { Period, PeriodType, TemporalContext } from "../types/period";
import { createPeriod } from "./createPeriod";

/**
 * Move to the next period
 */
export function next(context: TemporalContext, period: Period): Period {
  const { adapter } = context;
  const duration = getDuration(period.type);
  const nextValue = adapter.add(period.value, duration);

  return createPeriod(context, period.type, nextValue);
}

/**
 * Get duration object for a period type
 */
function getDuration(type: PeriodType, count: number = 1): any {
  switch (type) {
    case "year":
      return { years: count };
    case "month":
    case "stableMonth":
      return { months: count };
    case "week":
      return { weeks: count };
    case "day":
      return { days: count };
    case "hour":
      return { hours: count };
    case "minute":
      return { minutes: count };
    case "second":
      return { seconds: count };
    case "quarter":
      return { months: count * 3 };
    default:
      return {};
  }
}
