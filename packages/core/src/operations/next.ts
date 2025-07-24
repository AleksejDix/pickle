import type { Period, Unit, Temporal } from "../types";
import { createPeriod } from "./createPeriod";

/**
 * Move to the next period
 */
export function next(temporal: Temporal, period: Period): Period {
  const { adapter } = temporal;
  const duration = getDuration(period.type);
  const nextValue = adapter.add(period.date, duration);

  // Create a temporary point-in-time period for the new date
  const tempPeriod: Period = {
    start: nextValue,
    end: nextValue,
    type: "second",
    date: nextValue,
  };

  return createPeriod(temporal, period.type, tempPeriod);
}

/**
 * Get duration object for a period type
 */
function getDuration(type: Unit, count: number = 1): any {
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
