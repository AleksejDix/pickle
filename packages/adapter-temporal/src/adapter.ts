import type { Adapter, Unit, UnitHandler } from "@usetemporal/core";
import { yearHandler } from "./units/year";
import { quarterHandler } from "./units/quarter";
import { monthHandler } from "./units/month";
import { createWeekHandler } from "./units/week";
import { dayHandler } from "./units/day";
import { hourHandler } from "./units/hour";
import { minuteHandler } from "./units/minute";
import { secondHandler } from "./units/second";

/**
 * Create a functional Temporal API adapter with modular unit handlers
 */
export function createTemporalAdapter(options?: {
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}): Adapter {
  // Check if Temporal API is available
  if (typeof (globalThis as any).Temporal === "undefined") {
    throw new Error(
      "Temporal API is not available in this environment. Please use a polyfill or different adapter."
    );
  }

  const weekStartsOn = options?.weekStartsOn ?? 1;
  
  // Create handlers map with proper typing
  const handlers: Record<Exclude<Unit, "custom" | "stableMonth">, UnitHandler> = {
    year: yearHandler,
    quarter: quarterHandler,
    month: monthHandler,
    week: createWeekHandler(weekStartsOn),
    day: dayHandler,
    hour: hourHandler,
    minute: minuteHandler,
    second: secondHandler,
  };

  return {
    startOf(date: Date, unit: Exclude<Unit, "custom" | "stableMonth">): Date {
      return handlers[unit].startOf(date);
    },

    endOf(date: Date, unit: Exclude<Unit, "custom" | "stableMonth">): Date {
      return handlers[unit].endOf(date);
    },

    add(date: Date, amount: number, unit: Exclude<Unit, "custom" | "stableMonth">): Date {
      return handlers[unit].add(date, amount);
    },

    diff(from: Date, to: Date, unit: Exclude<Unit, "custom" | "stableMonth">): number {
      return handlers[unit].diff(from, to);
    },
  };
}

// Export a default instance with Monday as week start
export const temporalAdapter = createTemporalAdapter({ weekStartsOn: 1 });