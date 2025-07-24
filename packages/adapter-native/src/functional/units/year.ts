import type { UnitHandler } from "@usetemporal/core";

/**
 * Year unit handler - pure functional implementation
 */
export const yearHandler: UnitHandler = {
  startOf: (date: Date): Date => {
    return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
  },

  endOf: (date: Date): Date => {
    return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
  },

  add: (date: Date, amount: number): Date => {
    return new Date(
      date.getFullYear() + amount,
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    );
  },

  diff: (from: Date, to: Date): number => {
    return to.getFullYear() - from.getFullYear();
  },
};