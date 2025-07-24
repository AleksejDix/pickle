import type { Period, Unit, Temporal } from "../types";
import { createPeriod } from "./createPeriod";

/**
 * Move to the previous period
 */
export function previous(temporal: Temporal, period: Period): Period {
  const { adapter } = temporal;

  // Handle custom periods by using duration
  if (period.type === "custom") {
    const duration = period.end.getTime() - period.start.getTime() + 1;
    const prevEnd = new Date(period.start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duration + 1);
    return {
      start: prevStart,
      end: prevEnd,
      type: "custom",
      date: prevStart,
    };
  }

  // Handle stableMonth specially
  if (period.type === "stableMonth") {
    const prevMonth = new Date(
      period.date.getFullYear(),
      period.date.getMonth() - 1,
      1
    );
    const tempPeriod: Period = {
      start: prevMonth,
      end: prevMonth,
      type: "second",
      date: prevMonth,
    };
    return createPeriod(temporal, "stableMonth", tempPeriod);
  }

  const prevValue = adapter.add(
    period.date,
    -1,
    period.type as Exclude<Unit, "custom" | "stableMonth">
  );

  // Create a temporary point-in-time period for the new date
  const tempPeriod: Period = {
    start: prevValue,
    end: prevValue,
    type: "second",
    date: prevValue,
  };

  return createPeriod(temporal, period.type, tempPeriod);
}
