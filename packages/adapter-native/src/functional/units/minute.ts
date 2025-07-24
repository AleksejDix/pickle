import type { UnitHandler } from "@usetemporal/core";

/**
 * Minute unit handler - pure functional implementation
 */
export const minuteHandler: UnitHandler = {
  startOf: (date: Date): Date => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      0, 0
    );
  },

  endOf: (date: Date): Date => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      59, 999
    );
  },

  add: (date: Date, amount: number): Date => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + amount);
    return d;
  },

  diff: (from: Date, to: Date): number => {
    const diffMs = to.getTime() - from.getTime();
    return Math.floor(diffMs / (60 * 1000));
  },
};