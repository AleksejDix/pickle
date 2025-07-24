import type { UnitHandler } from "@usetemporal/core";

/**
 * Month unit handler - pure functional implementation
 */
export const monthHandler: UnitHandler = {
  startOf: (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  },

  endOf: (date: Date): Date => {
    // Get last day of month by going to next month's day 0
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  },

  add: (date: Date, amount: number): Date => {
    const d = new Date(date);
    const targetMonth = d.getMonth() + amount;
    const originalDay = d.getDate();
    
    // Set to the first day to avoid month overflow issues
    d.setDate(1);
    d.setMonth(targetMonth);
    
    // Try to restore the original day, handling month-end edge cases
    const lastDayOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(originalDay, lastDayOfMonth));
    
    return d;
  },

  diff: (from: Date, to: Date): number => {
    return (
      (to.getFullYear() - from.getFullYear()) * 12 +
      (to.getMonth() - from.getMonth())
    );
  },
};