import type { Period, Temporal, Unit } from "../types";
import { divide } from "./divide";

export interface SplitOptions {
  by?: Exclude<Unit, "custom">;
  count?: number;
  duration?: Partial<{
    years: number;
    months: number;
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>;
}

/**
 * Split a period into smaller units with flexible options
 */
export function split(
  temporal: Temporal,
  period: Period,
  options: SplitOptions
): Period[] {
  if (options.by) {
    return divide(temporal, period, options.by);
  }

  if (options.count) {
    // Split into N equal parts
    const totalMs = period.end.getTime() - period.start.getTime();
    const partMs = totalMs / options.count;
    const parts: Period[] = [];

    for (let i = 0; i < options.count; i++) {
      const start = new Date(period.start.getTime() + i * partMs);
      const end = new Date(period.start.getTime() + (i + 1) * partMs);

      parts.push({
        start,
        end: i === options.count - 1 ? period.end : end,
        type: "custom",
        date: start,
      });
    }

    return parts;
  }

  if (options.duration) {
    // Split by duration
    const parts: Period[] = [];
    let current = new Date(period.start);

    while (current < period.end) {
      const start = new Date(current);
      // Add each duration component separately
      let next = new Date(current);
      const dur = options.duration;
      if (dur.years) next = temporal.adapter.add(next, dur.years, "year");
      if (dur.months) next = temporal.adapter.add(next, dur.months, "month");
      if (dur.weeks) next = temporal.adapter.add(next, dur.weeks, "week");
      if (dur.days) next = temporal.adapter.add(next, dur.days, "day");
      if (dur.hours) next = temporal.adapter.add(next, dur.hours, "hour");
      if (dur.minutes) next = temporal.adapter.add(next, dur.minutes, "minute");
      if (dur.seconds) next = temporal.adapter.add(next, dur.seconds, "second");
      const end = next > period.end ? period.end : next;

      parts.push({
        start,
        end,
        type: "custom",
        date: start,
      });

      current = next;
    }

    return parts;
  }

  throw new Error("Split requires either 'by', 'count', or 'duration' option");
}
