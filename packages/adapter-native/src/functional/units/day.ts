import type { UnitHandler } from "@usetemporal/core";

/**
 * Day unit handler - pure functional implementation
 */
export const dayHandler: UnitHandler = {
  startOf: (date: Date): Date => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0, 0, 0, 0
    );
  },

  endOf: (date: Date): Date => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23, 59, 59, 999
    );
  },

  add: (date: Date, amount: number): Date => {
    const d = new Date(date);
    d.setDate(d.getDate() + amount);
    return d;
  },

  diff: (from: Date, to: Date): number => {
    const fromStart = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const toStart = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    const diffMs = toStart.getTime() - fromStart.getTime();
    return Math.floor(diffMs / (24 * 60 * 60 * 1000));
  },
};