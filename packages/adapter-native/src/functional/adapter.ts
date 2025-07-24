import type { Adapter, AdapterUnit, UnitHandler } from "@usetemporal/core";
import { yearHandler } from "./units/year";
import { monthHandler } from "./units/month";
import { createWeekHandler } from "./units/week";
import { dayHandler } from "./units/day";
import { hourHandler } from "./units/hour";
import { minuteHandler } from "./units/minute";
import { secondHandler } from "./units/second";
import { quarterHandler } from "./units/quarter";

/**
 * Create a functional native date adapter
 * Composes unit handlers into a unified adapter interface
 */
export function createNativeAdapter(options?: {
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}): Adapter {
  const weekStartsOn = options?.weekStartsOn ?? 1;
  
  // Create handlers map
  const handlers: Record<AdapterUnit, UnitHandler> = {
    year: yearHandler,
    month: monthHandler,
    week: createWeekHandler(weekStartsOn),
    day: dayHandler,
    hour: hourHandler,
    minute: minuteHandler,
    second: secondHandler,
    quarter: quarterHandler,
  };

  return {
    startOf: (date: Date, unit: AdapterUnit): Date => {
      return handlers[unit].startOf(date);
    },

    endOf: (date: Date, unit: AdapterUnit): Date => {
      return handlers[unit].endOf(date);
    },

    add: (date: Date, amount: number, unit: AdapterUnit): Date => {
      return handlers[unit].add(date, amount);
    },

    diff: (from: Date, to: Date, unit: AdapterUnit): number => {
      return handlers[unit].diff(from, to);
    },
  };
}

// Export a default instance with Monday as week start
export const nativeFunctionalAdapter = createNativeAdapter({ weekStartsOn: 1 });