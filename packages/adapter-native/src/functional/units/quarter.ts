import type { UnitHandler } from "@usetemporal/core";

/**
 * Quarter unit handler - pure functional implementation
 */
export const quarterHandler: UnitHandler = {
  startOf: (date: Date): Date => {
    const month = date.getMonth();
    const quarterStartMonth = Math.floor(month / 3) * 3;
    return new Date(date.getFullYear(), quarterStartMonth, 1, 0, 0, 0, 0);
  },

  endOf: (date: Date): Date => {
    const month = date.getMonth();
    const quarterStartMonth = Math.floor(month / 3) * 3;
    const quarterEndMonth = quarterStartMonth + 2;
    // Get last day of quarter by going to next month's day 0
    return new Date(date.getFullYear(), quarterEndMonth + 1, 0, 23, 59, 59, 999);
  },

  add: (date: Date, amount: number): Date => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + amount * 3);
    return d;
  },

  diff: (from: Date, to: Date): number => {
    const fromQuarter = Math.floor(from.getMonth() / 3);
    const toQuarter = Math.floor(to.getMonth() / 3);
    const yearDiff = to.getFullYear() - from.getFullYear();
    return yearDiff * 4 + (toQuarter - fromQuarter);
  },
};