import type { UnitHandler } from "@usetemporal/core";

/**
 * Hour unit handler - pure functional implementation
 */
export const hourHandler: UnitHandler = {
  startOf: (date: Date): Date => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      0, 0, 0
    );
  },

  endOf: (date: Date): Date => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      59, 59, 999
    );
  },

  add: (date: Date, amount: number): Date => {
    const d = new Date(date);
    d.setHours(d.getHours() + amount);
    return d;
  },

  diff: (from: Date, to: Date): number => {
    const diffMs = to.getTime() - from.getTime();
    return Math.floor(diffMs / (60 * 60 * 1000));
  },
};