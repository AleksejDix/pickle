import type { Period, Unit, Temporal } from "../types";
import { createPeriod } from "./createPeriod";

/**
 * Move by a specific number of periods
 */
export function go(temporal: Temporal, period: Period, steps: number): Period {
  if (steps === 0) return period;

  const { adapter } = temporal;

  // Handle custom periods by using duration
  if (period.type === "custom") {
    const duration = period.end.getTime() - period.start.getTime() + 1;
    let newStart: Date;
    if (steps > 0) {
      newStart = new Date(period.start.getTime() + duration * steps);
    } else {
      newStart = new Date(period.start.getTime() - duration * Math.abs(steps));
    }
    const newEnd = new Date(newStart.getTime() + duration - 1);
    return {
      start: newStart,
      end: newEnd,
      type: "custom",
      date: newStart,
    };
  }

  // Handle stableMonth specially
  if (period.type === "stableMonth") {
    const targetMonth = new Date(
      period.date.getFullYear(),
      period.date.getMonth() + steps,
      1
    );
    const tempPeriod: Period = {
      start: targetMonth,
      end: targetMonth,
      type: "second",
      date: targetMonth,
    };
    return createPeriod(temporal, "stableMonth", tempPeriod);
  }

  const newValue = adapter.add(
    period.date,
    steps,
    period.type as Exclude<Unit, "custom" | "stableMonth">
  );

  // Create a temporary point-in-time period for the new date
  const tempPeriod: Period = {
    start: newValue,
    end: newValue,
    type: "second",
    date: newValue,
  };

  return createPeriod(temporal, period.type, tempPeriod);
}
