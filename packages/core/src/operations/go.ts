import type { Period, Unit, Temporal } from "../types";
import { createPeriod } from "./createPeriod";

/**
 * Move by a specific number of periods
 */
export function go(temporal: Temporal, period: Period, steps: number): Period {
  if (steps === 0) return period;

  const { adapter } = temporal;
  const duration = getDuration(period.type, Math.abs(steps));
  const newValue =
    steps > 0
      ? adapter.add(period.date, duration)
      : adapter.subtract(period.date, duration);

  // Create a temporary point-in-time period for the new date
  const tempPeriod: Period = {
    start: newValue,
    end: newValue,
    type: "second",
    date: newValue,
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
