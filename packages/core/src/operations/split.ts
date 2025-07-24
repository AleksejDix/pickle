import type { Period, Temporal } from "../types/period";
import type { DivideUnit } from "../types/reactive";
import { divide } from "./divide";

export interface SplitOptions {
  by?: DivideUnit;
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
        value: start,
        number: i + 1,
      });
    }

    return parts;
  }

  if (options.duration) {
    // Split by duration
    const parts: Period[] = [];
    let current = new Date(period.start);
    let index = 0;

    while (current < period.end) {
      const start = new Date(current);
      const next = temporal.adapter.add(current, options.duration);
      const end = next > period.end ? period.end : next;

      parts.push({
        start,
        end,
        type: "custom",
        value: start,
        number: index + 1,
      });

      current = next;
      index++;
    }

    return parts;
  }

  throw new Error("Split requires either 'by', 'count', or 'duration' option");
}
