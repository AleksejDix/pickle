import type { Period, PeriodType, TemporalContext } from "../types/period";
import { createPeriod } from "./createPeriod";

/**
 * Move by a specific number of periods
 */
export function go(
  context: TemporalContext,
  period: Period,
  steps: number
): Period {
  if (steps === 0) return period;

  const { adapter } = context;
  const duration = getDuration(period.type, Math.abs(steps));
  const newValue =
    steps > 0
      ? adapter.add(period.value, duration)
      : adapter.subtract(period.value, duration);

  return createPeriod(context, period.type, newValue);
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
