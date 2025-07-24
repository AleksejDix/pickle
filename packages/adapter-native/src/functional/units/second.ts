import type { UnitHandler } from "@usetemporal/core";

/**
 * Second unit handler - pure functional implementation
 */
export const secondHandler: UnitHandler = {
  startOf: (date: Date): Date => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      0
    );
  },

  endOf: (date: Date): Date => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      999
    );
  },

  add: (date: Date, amount: number): Date => {
    const d = new Date(date);
    d.setSeconds(d.getSeconds() + amount);
    return d;
  },

  diff: (from: Date, to: Date): number => {
    const diffMs = to.getTime() - from.getTime();
    return Math.floor(diffMs / 1000);
  },
};