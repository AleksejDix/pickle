import type { UnitHandler } from "@usetemporal/core";

/**
 * Create week unit handler with configurable week start day
 */
export function createWeekHandler(weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1): UnitHandler {
  return {
    startOf: (date: Date): Date => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = (day - weekStartsOn + 7) % 7;
      d.setDate(d.getDate() - diff);
      d.setHours(0, 0, 0, 0);
      return d;
    },

    endOf: (date: Date): Date => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = (day - weekStartsOn + 7) % 7;
      d.setDate(d.getDate() - diff + 6);
      d.setHours(23, 59, 59, 999);
      return d;
    },

    add: (date: Date, amount: number): Date => {
      const d = new Date(date);
      d.setDate(d.getDate() + amount * 7);
      return d;
    },

    diff: (from: Date, to: Date): number => {
      const diffMs = to.getTime() - from.getTime();
      return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
    },
  };
}