import type { Period, PeriodType, TemporalContext } from "../types/period";
import type { DivideUnit } from "../types/reactive";
import { createPeriod } from "./createPeriod";

/**
 * Divide a period into smaller units
 */
export function divide(
  context: TemporalContext,
  period: Period,
  unit: DivideUnit
): Period[] {
  const { adapter } = context;

  if (unit === "stableMonth") {
    throw new Error(
      "Cannot divide by stableMonth. Use useStableMonth() instead."
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
        value: new Date(currentDate),
        number: currentDate.getDate(),
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
            value: weekDays[0].value,
            number: Math.floor(i / 7) + 1,
          });
        }
      }
      return weeks;
    }

    return days;
  }

  // Standard division using adapter's eachInterval
  const intervals = adapter.eachInterval(period.start, period.end, unit);

  return intervals.map((date) => {
    const start = adapter.startOf(date, unit, {
      weekStartsOn: context.weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    });
    const end = adapter.endOf(date, unit, {
      weekStartsOn: context.weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    });

    return {
      start,
      end,
      type: unit as PeriodType,
      value: date,
      number: getNumber(date, unit, adapter),
    };
  });
}

/**
 * Get the numeric value for a period type
 */
function getNumber(
  date: Date,
  type: PeriodType | DivideUnit,
  adapter: any
): number {
  switch (type) {
    case "year":
      return date.getFullYear();
    case "month":
    case "stableMonth":
      return date.getMonth() + 1;
    case "week":
      // Calculate week number
      const startOfYear = adapter.startOf(date, "year");
      const startOfWeek = adapter.startOf(date, "week");
      const daysDiff = Math.floor(
        (startOfWeek.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
      );
      return Math.floor(daysDiff / 7) + 1;
    case "day":
      return date.getDate();
    case "hour":
      return date.getHours();
    case "minute":
      return date.getMinutes();
    case "second":
      return date.getSeconds();
    case "quarter":
      return Math.floor(date.getMonth() / 3) + 1;
    default:
      return 0;
  }
}
