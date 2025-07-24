import type { Period, PeriodType, TemporalContext } from "../types";
import { createPeriod } from "./createPeriod";

/**
 * Move to the previous period
 */
export function previous(context: TemporalContext, period: Period): Period {
  const { adapter } = context;
  const duration = getDuration(period.type);
  const prevValue = adapter.subtract(period.date, duration);

  // Create a temporary point-in-time period for the new date
  const tempPeriod: Period = {
    start: prevValue,
    end: prevValue,
    type: "second",
    date: prevValue,
  };

  return createPeriod(context, period.type, tempPeriod);
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
