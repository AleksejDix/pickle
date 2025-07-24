import type { Period, Unit, Temporal } from "../types";
import { createPeriod } from "./createPeriod";

/**
 * Move to the next period
 */
export function next(temporal: Temporal, period: Period): Period {
  const { adapter } = temporal;

  // Handle custom periods by using duration
  if (period.type === "custom") {
    const duration = period.end.getTime() - period.start.getTime() + 1;
    const nextStart = new Date(period.end.getTime() + 1);
    const nextEnd = new Date(nextStart.getTime() + duration - 1);
    return {
      start: nextStart,
      end: nextEnd,
      type: "custom",
      date: nextStart,
    };
  }

  // Handle stableMonth specially
  if (period.type === "stableMonth") {
    const nextMonth = new Date(
      period.date.getFullYear(),
      period.date.getMonth() + 1,
      1
    );
    const tempPeriod: Period = {
      start: nextMonth,
      end: nextMonth,
      type: "second",
      date: nextMonth,
    };
    return createPeriod(temporal, "stableMonth", tempPeriod);
  }

  const nextValue = adapter.add(
    period.date,
    1,
    period.type as Exclude<Unit, "custom" | "stableMonth">
  );

  // Create a temporary point-in-time period for the new date
  const tempPeriod: Period = {
    start: nextValue,
    end: nextValue,
    type: "second",
    date: nextValue,
  };

  return createPeriod(temporal, period.type, tempPeriod);
}
