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

      currentDate = adapter.add(currentDate, { days: 1 });
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

  // Standard division using adapter's eachInterval
  // At this point, unit cannot be "custom" or "stableMonth" due to the checks above
  const intervals = adapter.eachInterval(
    period.start,
    period.end,
    unit as Exclude<Unit, "custom" | "stableMonth">
  );

  return intervals.map((date) => {
    const start = adapter.startOf(
      date,
      unit as Exclude<Unit, "custom" | "stableMonth">,
      {
        weekStartsOn: temporal.weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      }
    );
    const end = adapter.endOf(
      date,
      unit as Exclude<Unit, "custom" | "stableMonth">,
      {
        weekStartsOn: temporal.weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      }
    );

    return {
      start,
      end,
      type: unit,
      date: date,
    };
  });
}
