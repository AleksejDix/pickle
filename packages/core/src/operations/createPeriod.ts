import type { Period, Unit, Temporal } from "../types";

/**
 * Create a period of a specific type from another period
 * Uses the period's date as the reference point
 */
export function createPeriod(
  temporal: Temporal,
  type: Unit,
  period: Period
): Period {
  const { adapter } = temporal;
  const date = period.date;

  if (type === "custom") {
    // For custom periods, just return the original period
    return period;
  }

  // Handle stableMonth specially
  if (type === "stableMonth") {
    // Get first day of the month
    const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    // Find the start of the week containing the 1st
    const weekStart = adapter.startOf(firstOfMonth, "week");

    // For end, go to first of next month and find its week start, then back 1ms
    const firstOfNextMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      1
    );
    const nextWeekStart = adapter.startOf(firstOfNextMonth, "week");
    const end = new Date(nextWeekStart.getTime() - 1);

    return {
      start: weekStart,
      end,
      type: "stableMonth",
      date,
    };
  }

  const start = adapter.startOf(
    date,
    type as Exclude<Unit, "custom" | "stableMonth">
  );
  const end = adapter.endOf(
    date,
    type as Exclude<Unit, "custom" | "stableMonth">
  );

  return {
    start,
    end,
    type,
    date,
  };
}
