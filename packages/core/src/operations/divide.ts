import type { Period, Unit, Temporal } from "../types";

/**
 * Divide a period into smaller units
 */
export function divide(
  temporal: Temporal,
  period: Period,
  unit: Unit
): Period[] {
  const { adapter } = temporal;

  if (unit === "stableMonth") {
    throw new Error(
      "Cannot divide by stableMonth. Use useStableMonth() instead."
    );
  }

  if (unit === "custom") {
    throw new Error(
      "Cannot divide by custom unit. Custom periods have arbitrary boundaries."
    );
  }

  // Special handling for stableMonth periods
  if (period.type === "stableMonth") {
    if (unit !== "day" && unit !== "week") {
      throw new Error("stableMonth can only be divided by 'day' or 'week'");
    }

    const days: Period[] = [];
    let currentDate = new Date(period.start);

    while (currentDate <= period.end) {
      const dayStart = adapter.startOf(currentDate, "day");
      const dayEnd = adapter.endOf(currentDate, "day");

      days.push({
        start: dayStart,
        end: dayEnd,
        type: "day",
        date: new Date(currentDate),
      });

      currentDate = adapter.add(currentDate, 1, "day");
    }

    if (unit === "week") {
      // Group days into weeks
      const weeks: Period[] = [];
      for (let i = 0; i < days.length; i += 7) {
        const weekDays = days.slice(i, i + 7);
        if (weekDays.length > 0) {
          weeks.push({
            start: weekDays[0].start,
            end: weekDays[weekDays.length - 1].end,
            type: "week",
            date: weekDays[0].date,
          });
        }
      }
      return weeks;
    }

    return days;
  }

  // Standard division - calculate intervals manually
  const periods: Period[] = [];
  let current = new Date(period.start);
  const safeUnit = unit as Exclude<Unit, "custom" | "stableMonth">;

  while (current <= period.end) {
    const start = adapter.startOf(current, safeUnit);
    const end = adapter.endOf(current, safeUnit);

    // Only include periods that overlap with the parent period
    if (end >= period.start && start <= period.end) {
      periods.push({
        start: start < period.start ? period.start : start,
        end: end > period.end ? period.end : end,
        type: unit,
        date: new Date(current),
      });
    }

    // Move to next period
    current = adapter.add(current, 1, safeUnit);

    // For safety, break if we've gone too far (prevent infinite loops)
    if (periods.length > 1000) {
      throw new Error("Too many periods generated in divide operation");
    }
  }

  return periods;
}
