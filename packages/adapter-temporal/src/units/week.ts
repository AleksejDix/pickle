import type { UnitHandler } from "@usetemporal/core";

export function createWeekHandler(weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1): UnitHandler {
  return {
    startOf(date: Date): Date {
      const dayOfWeek = date.getDay();
      const daysToSubtract = (dayOfWeek - weekStartsOn + 7) % 7;
      const result = new Date(date);
      result.setDate(date.getDate() - daysToSubtract);
      result.setHours(0, 0, 0, 0);
      return result;
    },
    
    endOf(date: Date): Date {
      const dayOfWeek = date.getDay();
      const daysToAdd = (weekStartsOn + 6 - dayOfWeek + 7) % 7;
      const result = new Date(date);
      result.setDate(date.getDate() + daysToAdd);
      result.setHours(23, 59, 59, 999);
      return result;
    },
    
    add(date: Date, amount: number): Date {
      const result = new Date(date);
      result.setDate(date.getDate() + amount * 7);
      return result;
    },
    
    diff(from: Date, to: Date): number {
      const diffInDays = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
      return Math.floor(diffInDays / 7);
    },
  };
}