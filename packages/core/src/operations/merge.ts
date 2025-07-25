import type { Period, Temporal, Unit } from "../types";
import { createPeriod } from "./createPeriod";

/**
 * Merge multiple periods into a single period
 */
export function merge(temporal: Temporal, periods: Period[], targetUnit?: Unit): Period | null {
  if (periods.length === 0) return null;
  if (periods.length === 1) return periods[0];

  // Sort periods by start time
  const sorted = [...periods].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

  const start = sorted[0].start;
  const end = sorted[sorted.length - 1].end;

  // Check for natural units
  if (periods.length === 7 && periods.every((p) => p.type === "day")) {
    // Check if these 7 days form a complete week
    const startOfWeek = temporal.adapter.startOf(periods[0].date, "week");
    const endOfWeek = temporal.adapter.endOf(periods[6].date, "week");

    if (
      start.getTime() === startOfWeek.getTime() &&
      end.getTime() === endOfWeek.getTime()
    ) {
      return createPeriod(temporal, "week", periods[3]); // Middle day
    }
  }

  if (periods.length === 3 && periods.every((p) => p.type === "month")) {
    // Check if these form a quarter - they must be consecutive months
    const months = sorted.map((p) => p.date.getMonth());
    const firstMonth = months[0];

    // Check if it's a valid quarter start (0, 3, 6, 9) and consecutive
    if (
      firstMonth % 3 === 0 &&
      months[1] === firstMonth + 1 &&
      months[2] === firstMonth + 2
    ) {
      return createPeriod(temporal, "quarter", periods[1]);
    }
  }

  // If target unit is specified, create a period of that type
  if (targetUnit) {
    // Use the middle date as reference
    const middleDate = new Date((start.getTime() + end.getTime()) / 2);
    const tempPeriod: Period = {
      start: middleDate,
      end: middleDate,
      type: "second",
      date: middleDate,
    };
    return createPeriod(temporal, targetUnit, tempPeriod);
  }

  // Return custom period
  return {
    start,
    end,
    type: "custom",
    date: new Date((start.getTime() + end.getTime()) / 2),
  };
}
